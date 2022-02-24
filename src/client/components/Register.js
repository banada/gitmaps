import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Paths } from '../routes';
import fetchData from '../fetchData';

/**
 *  Props
 *
 */
class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: null,
            email: null,
            password: null
        }
    }

    componentDidMount = () => {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    navToLogin = () => {
        window.location = Paths.Login;
    }

    onKeyUp = (evt) => {
        // Enter key
        if (evt.keyCode === 13) {
            this.register();
        }
        // Escape key
        if (evt.keyCode === 27) {
            this.close();
        }
    }

    close = () => {
    }

    setUsername = (evt) => {
        this.setState({
            username: evt.target.value
        });
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

    // There is a bug in Joi that does not allow email
    // validation in the browser, so we diplay errors based
    // on the message from the server's response.
    register = async () => {
        const user = {
            email: this.state.email,
            username: this.state.username,
            password: this.state.password
        }
        const {status, data} = await fetchData('POST', 'auth/register', user);
        if (status !== 200) {
            if (data.msg) {
                toast.error(data.msg);
            } else {
                toast.error('Failed to register. Please try again.');
            }

            return;
        } else {
            // Save JWT
            if (data.jwt) {
                localStorage.setItem('token', data.jwt);
                // Redirect on success
                window.location = Paths.Home;
            } else {
                toast.error('There was a problem logging you in');
            }
        }
    }

    render() {
        return (
            <div className="w-full h-full fixed top-0 left-0 items-center text-center flex z-50">
                {/* Background */}
                <div
                    onClick={this.close}
                    className="absolute w-full h-full bg-gray-900 opacity-75"
                ></div>
                {/* Container */}
                <div className="bg-white w-11/12 sm:w-4/12 rounded-lg mx-auto flex flex-col justify-center items-center overflow-hidden z-50">
                    {/* Title */}
                    <div className="mb-4 px-8 py-4 bg-blue-500 shadow-sm w-full">
                        <span
                            className="text-2xl text-white font-semibold tracking-wide"
                        >
                            Register
                        </span>
                    </div>
                    {/* Content */}
                    <div className="my-2 w-10/12">
                        <div className="flex justify-start text-gray-600 font-semibold tracking-wide">
                            <span>E-mail</span>
                        </div>
                        <input
                            placeholder="E-mail"
                            onKeyUp={this.onKeyUp}
                            autoFocus={true}
                            type="email"
                            className="border border-gray-500 rounded px-4 py-2 w-full"
                            onChange={this.setEmail}
                            value={this.state.email || ''}
                        />
                    </div>
                    <div className="my-2 w-10/12">
                        <div className="flex justify-start text-gray-600 font-semibold tracking-wide">
                            <span>Username</span>
                        </div>
                        <input
                            placeholder="Username"
                            onKeyUp={this.onKeyUp}
                            type="text"
                            className="border border-gray-500 rounded px-4 py-2 w-full"
                            onChange={this.setUsername}
                            value={this.state.username || ''}
                        />
                    </div>
                    <div className="my-2 w-10/12">
                        <div className="flex justify-start text-gray-600 font-semibold tracking-wide">
                            <span>Password</span>
                        </div>
                        <input
                            placeholder="Password"
                            onKeyUp={this.onKeyUp}
                            type="password"
                            className="border border-gray-500 rounded px-4 py-2 w-full"
                            onChange={this.setPassword}
                            value={this.state.password || ''}
                        />
                    </div>
                    {/* Buttons */}
                    <button
                        className="bg-green-500 text-white rounded-lg text-2xl px-8 py-2 mt-6 shadow-md"
                        onClick={this.register}
                    >
                        Register
                    </button>
                    <p className="my-6 text-blue-700">
                        <a
                            href="#"
                            onClick={this.navToLogin}
                        >
                            Already have an account? Login
                        </a>
                    </p>
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

export default Register;

