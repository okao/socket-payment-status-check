import React, { useContext } from 'react';
import SocketContext from './contexts/SocketContext';
import { faker } from '@faker-js/faker';

export interface IApplicationProps {}

const Application: React.FunctionComponent<IApplicationProps> = (props) => {
    const PaymentId = 'e423-4f3f-9c3a-5c2a-1a2b-3c4d-5e6f';
    const { socket, uid, users } = useContext(SocketContext).SocketState;

    //generate a random human name
    const email = faker.internet.email();

    return (
        <div>
            <h2>Socket IO Information: (PaymentId: {PaymentId})</h2>
            <p>
                Your user ID: <strong>{uid}</strong>
                <br />
                Users online: <strong>{users.length}</strong>
                <br />
                Socket ID: <strong>{socket?.id}</strong>
                <br />
                Email: <strong>{email}</strong>
                <br />
            </p>
            <div>
                <h3>Sending Payment</h3>
                {users.map((user) => {
                    if (user !== socket?.id) {
                        return (
                            <button
                                key={user}
                                onClick={() => {
                                    socket?.emit('sendPayment', {
                                        to: user,
                                        amount: 100,
                                        paymentId: PaymentId
                                    });
                                }}
                            >
                                Send 100 to {user}
                            </button>
                        );
                    }
                    // return <></>;
                })}
            </div>
        </div>
    );
};

export default Application;
