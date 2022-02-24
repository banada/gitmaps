import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import fetchData from '../fetchData';

const ResetStage = {
    Request: 0,
    Requested: 1,
    Reset: 2,
    Done: 3
}

/**
 *  Props
 *
 */
class PasswordReset extends React.Component {
    constructor(props) {
        super(props);

        let stage = ResetStage.Request;
        let hash = this.props.match?.params?.resetHash;
        if (hash) {
            stage = ResetStage.Reset;
        }

        this.state = {
            stage: stage,
            hash: hash,
            email: null,
            password: null
        }
    }

    onKeyUp = (evt) => {
        // Enter key
        if (evt.keyCode === 13) {
            this.login();
        }
        // Escape key
        if (evt.keyCode === 27) {
            this.close();
        }
    }

    close = () => {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    setEmail = (evt) => {
        this.setState({
            email: evt.target.value
        });
    }

    setPassword = (evt) => {
        this.setState({
            password: evt.target.value
        });
    }

    requestReset = async () => {
        const request = {
            email: this.state.email
        }
        const {status, data} = await fetchData('POST', 'auth/requestreset', request);
        if (status !== 200) {
            toast.error('There was a problem. Please try again.');
            return;
        } else {
            this.setState({
                stage: ResetStage.Requested
            });
        }
    }

    reset = async () => {
        const request = {
            password: this.state.password,
            resetHash: this.state.hash
        }
        const {status, data} = await fetchData('POST', 'auth/reset', request);
        if (status !== 200) {
            toast.error('There was a problem. Please try again.');
            return;
        } else {
            this.setState({
                stage: ResetStage.Done
            });
        }
    }

    render() {
        return (
            <div className="w-full h-full fixed top-0 left-0 items-center text-center flex z-50">
                {/* Background */}
                <div
                    className="absolute w-full h-full bg-gray-900 opacity-75"
                    onClick={this.close}
                ></div>
                {/* Container */}
                <div className="bg-white w-11/12 sm:w-4/12 rounded-lg z-50 mx-auto flex flex-col justify-center items-center overflow-hidden">
                    {/* Title */}
                    <div className="mb-4 px-8 py-4 bg-blue-500 shadow-sm w-full">
                        <div className="text-white font-semibold tracking-wide text-2xl">
                            {(this.state.stage === ResetStage.Request) &&
                                <span>Request a Password Reset</span>
                            }
                            {(this.state.stage === ResetStage.Requested) &&
                                <span>Request a Password Reset</span>
                            }
                            {(this.state.stage === ResetStage.Reset) &&
                                <span>Choose a New Password</span>
                            }
                        </div>
                    </div>
                    {/* Content */}
                    <div className="my-2 w-10/12">
                        {(this.state.stage === ResetStage.Request) &&
                            <>
                                <div className="flex justify-start text-gray-600 font-semibold tracking-wide">
                                    <span>E-mail</span>
                                </div>
                                <input
                                    placeholder="E-mail"
                                    autoFocus={true}
                                    onKeyUp={this.onKeyUp}
                                    type="email"
                                    className="w-full border border-gray-500 rounded px-4 py-2 w-full"
                                    onChange={this.setEmail}
                                    value={this.state.email || ''}
                                />
                            </>
                        }
                        {(this.state.stage === ResetStage.Requested) &&
                            <div className="flex justify-center text-gray-700 font-semibold text-xl mt-2 mb-6">
                                Please check your e-mail for a link to reset your password.
                            </div>
                        }
                        {(this.state.stage === ResetStage.Reset) &&
                            <>
                                <div className="flex justify-start text-gray-600 font-semibold tracking-wide">
                                    <span>Password</span>
                                </div>
                                <input
                                    placeholder="Password"
                                    onKeyUp={this.onKeyUp}
                                    type="password"
                                    className="w-full border border-gray-500 rounded px-4 py-2 w-full"
                                    onChange={this.setPassword}
                                    value={this.state.password || ''}
                                />
                            </>
                        }
                        {(this.state.stage === ResetStage.Done) &&
                            <>
                                <div className="flex justify-center text-gray-700 mt-2">
                                    <span className="font-semibold text-xl">
                                        Your password has been reset! Please log back in.
                                    </span>
                                </div>
                                <div className="flex justify-center text-gray-700 mt-2 mb-6">
                                    <a
                                        className="text-xl text-blue-500 underline"
                                        href="/login"
                                    >
                                        Log in
                                    </a>
                                </div>
                            </>
                        }
                    </div>
                    {/* Buttons */}
                    {(this.state.stage === ResetStage.Request) &&
                        <button
                            className="bg-green-500 text-white rounded-lg text-2xl px-8 py-2 my-6 shadow-md"
                            onClick={this.requestReset}
                        >
                            Request Reset
                        </button>
                    }
                    {(this.state.stage === ResetStage.Reset) &&
                        <button
                            className="bg-green-500 text-white rounded-lg text-2xl px-8 py-2 my-6 shadow-md"
                            onClick={this.reset}
                        >
                            <span>Reset Password</span>
                        </button>
                    }
                </div>
                <ToastContainer
                    position="bottom-center"
                    autoClose={3000}
                    hideProgressBar
                    newestOnTop
                />
            </div>
        );
    }
}

export default PasswordReset;

