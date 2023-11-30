import { Server as HttpServer } from 'http';
import { Socket, Server } from 'socket.io';
import { v4 } from 'uuid';
import { redisClient } from './conf/config';

interface IUser {
    uid: string;
    name: string;
    paymentId: string;
}

export class ServerSocket {
    public static instance: ServerSocket;
    public io: Server;
    private redisClient: any;

    /** Master list of all connected users */
    public users: {
        [uid: string]: string;
    };

    constructor(server: HttpServer) {
        ServerSocket.instance = this;
        this.users = {};
        this.io = new Server(server, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            cors: {
                origin: '*'
            }
        });

        this.io.on('connect', this.StartListeners);
        redisClient.connect();

        //on redis connect
        redisClient.on('connect', () => {
            console.log('Redis connected');
        });
    }

    StartListeners = (socket: Socket) => {
        socket.on('handshake', (callback: (uid: string, users: string[]) => void) => {
            console.info('Handshake received from: ' + socket.id);

            const reconnected = Object.values(this.users).includes(socket.id);

            if (reconnected) {
                console.info('This user has reconnected.');

                const uid = this.GetUidFromSocketID(socket.id);
                const users = Object.values(this.users);

                if (uid) {
                    console.info('Sending callback for reconnect ...');
                    callback(uid, users);
                    return;
                }
            }

            const uid = v4();
            this.users[uid] = socket.id;

            const users = Object.values(this.users);
            callback(uid, users);

            this.SendMessage(
                'user_connected',
                users.filter((id) => id !== socket.id),
                users
            );
        });

        socket.on('disconnect', () => {
            console.info('Disconnect received from: ' + socket.id);

            const uid = this.GetUidFromSocketID(socket.id);

            if (uid) {
                delete this.users[uid];

                const users = Object.values(this.users);

                this.SendMessage('user_disconnected', users, socket.id);
            }
        });

        socket.on('sendPayment', (payload: any) => {
            console.info('sendPayment received from: ' + socket.id + ' - Payload: ', payload);

            const users = Object.values(this.users);

            //get the payment from the cache
            const payment = this.GetPayment(payload.paymentId);
            const passcode = payload.passcode;

            // console.info('Payment from cache: ', payment);
            payment.then((result) => {
                console.info('Payment from cache: ', result);
                //if the payment is not in the cache
                if (!result) {
                    if (passcode === '1234') {
                        //save the payment to the cache
                        this.SavePayment(payload);
                        this.SendMessageSingle('paymentReceived', socket.id, payload);
                        return;
                    }
                } else {
                    console.info('Payment already exists in cache');
                    this.SendMessageSingle('paymentProcessed', socket.id, payload);
                    return;
                }
            });

            //error socket
            this.SendMessageSingle('paymentError', socket.id, payload);
        });
    };

    GetUidFromSocketID = (id: string) => {
        return Object.keys(this.users).find((uid) => this.users[uid] === id);
    };

    SendMessage = (name: string, users: string[], payload?: Object) => {
        console.info('Emitting event: ' + name + ' to', users);
        users.forEach((id) => (payload ? this.io.to(id).emit(name, payload) : this.io.to(id).emit(name)));
    };

    SendMessageSingle = (name: string, user: string, payload?: Object) => {
        // console.info('Emitting event: ' + name + ' to', user);
        this.io.to(user).emit(name, payload);
    };

    //save the payment to the cache
    SavePayment = async (payment: any) => {
        redisClient.set('payment:' + payment?.paymentId, JSON.stringify(payment));
    };

    //remove the payment from the cache
    RemovePayment = (uid: string) => {
        redisClient.del(uid);
    };

    //get all the payments from the cache
    GetPayments = async () => {
        let payments: any[] = [];

        try {
            const all = await redisClient.keys('payment:*');
            all.map(async (key) => {
                const payment: any = JSON.parse((await redisClient.get(key)) || '{}');
                payments.push(payment);
            });
        } catch (error) {
            console.error('Error getting payments from cache: ', error);
        }
    };

    //get specific payment from the cache
    GetPayment = async (uid: string) => {
        try {
            const payment = await redisClient.get('payment:' + uid);
            if (payment) {
                // redisClient.disconnect();
                return JSON.parse(payment);
            }
        } catch (error) {
            console.error('Error getting payment from cache: ', error);
        }

        return null;
    };
}
