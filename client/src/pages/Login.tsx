import React, { useContext, useEffect, useState } from 'react';
import SocketContext from '../contexts/SocketContext';
import { faker } from '@faker-js/faker';
import '../css/app.css';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSocket } from '../hooks/useSocket';

export interface IApplicationProps {
    // history: any;
}

enum PaymentStatus {
    Success = 'success',
    Fail = 'fail',
    Pending = 'pending',
    Processed = 'processed',
    Started = 'started'
}

const schema = yup
    .object({
        name: yup.string().required('Name is required.'),
        passcode: yup.string().required('Passcode is required!').min(4).max(4),
        paymentId: yup.string().required('Payment Id is required!'),
        amount: yup.string().required('Amount is required!')
    })
    .required();
type FormData = yup.InferType<typeof schema>;

const Login: React.FunctionComponent<IApplicationProps> = (props) => {
    const { socket, uid, users } = useContext(SocketContext).SocketState;
    let navigate = useNavigate();
    // const randomName = faker.person.fullName();
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.Started);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<FormData>({
        resolver: yupResolver(schema)
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
        socket?.emit('sendPayment', {
            to: uid,
            amount: data.amount,
            paymentId: data.paymentId,
            name: data.name,
            paymentStatus: paymentStatus,
            passcode: data.passcode
        });

        reset({
            name: '',
            paymentId: '',
            amount: '',
            passcode: ''
        });

        socket?.on('paymentReceived', (data: any) => {
            console.log('paymentReceived', data);
            // navigate('/');
            setPaymentStatus(PaymentStatus.Pending);
            setTimeout(() => {
                setPaymentStatus(PaymentStatus.Success);

                setTimeout(() => {
                    // setPaymentStatus(PaymentStatus.Processed);
                    setPaymentStatus(PaymentStatus.Started);
                    navigate('/login');
                }, 5500);
            }, 1500);
        });

        socket?.on('paymentProcessed', (data: any) => {
            console.log('paymentProcessed', data);
            // navigate('/');
            setPaymentStatus(PaymentStatus.Pending);
            setTimeout(() => {
                setPaymentStatus(PaymentStatus.Processed);

                setTimeout(() => {
                    // setPaymentStatus(PaymentStatus.Processed);
                    setPaymentStatus(PaymentStatus.Started);
                    navigate('/login');
                }, 5500);
            }, 1500);
        });

        socket?.on('paymentError', (data: any) => {
            console.log('paymentError', data);

            //change payment status
            setPaymentStatus(PaymentStatus.Fail);
        });
    };

    useEffect(() => {
        console.log('Login useEffect');
    }, [socket, uid, users, navigate]);

    return (
        <>
            {/* simple tailwind username password login form */}
            <div className="flex flex-col h-screen bg-gray-100">
                <div className="grid place-items-center mx-2 my-20 sm:my-auto">
                    <div className="w-11/12 p-12 bg-white sm:w-8/12 md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12 sm:rounded-2xl">
                        <h1 className="text-3xl underline text-center font-black text-blue-500">Payment</h1>
                        <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                            {/* <div className="flex justify-between gap-3">
                                <span className="w-1/2">
                                    <label htmlFor="firstName" className="block text-xs font-semibold text-gray-600 uppercase">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        name="firstName"
                                        placeholder="John"
                                        autoComplete="given-name"
                                        className="block w-full px-1 py-3 mt-2 text-gray-800 border-b-2 border-gray-100 appearance-none focus:text-gray-500 focus:outline-none focus:border-gray-200"
                                        required
                                    />
                                </span>
                                <span className="w-1/2">
                                    <label htmlFor="lastName" className="block text-xs font-semibold text-gray-600 uppercase">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        name="lastName"
                                        placeholder="Doe"
                                        autoComplete="family-name"
                                        className="block w-full px-1 py-3 mt-2 text-gray-800 border-b-2 border-gray-100 appearance-none focus:text-gray-500 focus:outline-none focus:border-gray-200"
                                        required
                                    />
                                </span>
                            </div> */}
                            <label htmlFor="paymentId" className="block mt-2 text-xs font-semibold text-gray-600 uppercase">
                                Payment Id
                            </label>
                            <input
                                {...register('paymentId')}
                                id="paymentId"
                                type="paymentId"
                                name="paymentId"
                                autoComplete="hidden"
                                className="block w-full py-3 mt-2 text-gray-800 border-b-2 border-gray-100 appearance-none focus:text-gray-500 focus:outline-none focus:border-gray-200 text-center font-bold text-gray-400"
                            />
                            <div className="text-red-500 text-right text-xs font-bold">{errors.name?.message}</div>

                            <label htmlFor="name" className="block mt-2 text-xs font-semibold text-gray-600 uppercase">
                                Payer Name
                            </label>
                            <input
                                {...register('name')}
                                id="name"
                                type="name"
                                name="name"
                                autoComplete="name"
                                className="block w-full px-1 py-3 mt-2 text-gray-800 border-b-2 border-gray-100 appearance-none focus:text-gray-500 focus:outline-none focus:border-gray-200 text-center font-bold text-gray-400"
                            />
                            <div className="text-red-500 text-right text-xs font-bold">{errors.name?.message}</div>
                            {/* <label htmlFor="email" className="block mt-2 text-xs font-semibold text-gray-600 uppercase">
                                E-mail
                            </label> */}
                            {/* <input
                                {...register('email')}
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                className="block w-full px-1 py-3 mt-2 text-gray-800 border-b-2 border-gray-100 appearance-none focus:text-gray-500 focus:outline-none focus:border-gray-200"
                            />
                            <div className="text-red-500 text-right text-xs font-bold">{errors.email && <p>Name is required.</p>}</div> */}
                            <label htmlFor="password" className="block mt-2 text-xs font-semibold text-gray-600 uppercase">
                                Amount
                            </label>
                            <input
                                {...register('amount')}
                                id="amount"
                                name="amount"
                                type="number"
                                placeholder="Enter amount"
                                className="block w-full px-1 py-3 mt-2 mb-4 text-gray-800 border-b-2 border-gray-100 appearance-none focus:text-gray-500 focus:outline-none focus:border-gray-200 text-center"
                            />
                            <div className="text-red-500 text-right text-xs font-bold">{errors.amount?.message}</div>

                            <label htmlFor="password" className="block mt-2 text-xs font-semibold text-gray-600 uppercase">
                                Passcode
                            </label>
                            <input
                                {...register('passcode')}
                                id="passcode"
                                type="password"
                                name="passcode"
                                placeholder="Enter your passcode"
                                autoComplete="hidden"
                                className="block w-full px-1 py-3 mt-2 mb-4 text-gray-800 border-b-2 border-gray-100 appearance-none focus:text-gray-500 focus:outline-none focus:border-gray-200 text-center"
                            />
                            <div className="text-red-500 text-right text-xs font-bold">{errors.passcode?.message}</div>
                            <button
                                type="submit"
                                className="w-full py-3 mt-6 font-medium tracking-widest text-white uppercase bg-black shadow-lg focus:outline-none hover:bg-gray-900 hover:shadow bg-gradient-to-b from-blue-500 to-blue-800"
                            >
                                PROCEED
                            </button>
                            {/* <p className="flex justify-between inline-block mt-4 text-xs text-gray-500 cursor-pointer hover:text-black">
                                Don't have an account?{' '}
                                <a href="/" className="font-semibold text-gray-900">
                                    Register
                                </a>
                            </p> */}
                        </form>

                        {/* Paymet Status div */}
                        {/* {paymentStatus ? (
                            <div className="border p-16 bg-blue-200 my-10 text-center">Payment Processing ....</div>
                        ) : (
                            <div className="border p-16 bg-green-200 my-10"></div>
                        )} */}

                        {paymentStatus === PaymentStatus.Pending && (
                            <div className="border p-16 bg-blue-200 my-10 text-center">Payment Pending ....</div>
                        )}
                        {paymentStatus === PaymentStatus.Processed && (
                            <div className="border p-16 bg-green-200 my-10 text-center">Payment Already Processed ....</div>
                        )}
                        {paymentStatus === PaymentStatus.Success && (
                            <div className="border p-16 bg-green-200 my-10 text-center">Payment Success ....</div>
                        )}
                        {paymentStatus === PaymentStatus.Fail && <div className="border p-16 bg-red-200 my-10 text-center">Payment Failed ....</div>}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
