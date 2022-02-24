import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Paths } from '../routes';
import fetchData from '../fetchData';

/**
 *  Props
 *
 */
class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: null,
            password: null
        }
    }

    componentDidMount = () => {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    navToRegister = () => {
        window.location = Paths.Register;
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

    login = async () => {
        const user = {
            email: this.state.email,
            password: this.state.password
        }
        const {status, data} = await fetchData('POST', 'auth/login', user);
        if (status !== 200) {
            toast.error('Failed to login. Please try again.');
            return;
        } else {
            // Save JWT
            if (data.jwt) {
                localStorage.setItem('token', data.jwt);
                // Redirect
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
                    className="absolute w-full h-full bg-gray-900 opacity-75"
                    onClick={this.close}
                ></div>
                {/* Container */}
                <div className="bg-white w-11/12 sm:w-4/12 rounded-lg z-50 mx-auto flex flex-col justify-center items-center overflow-hidden">
                    {/* Title */}
                    <div className="mb-4 px-8 py-4 bg-blue-500 shadow-sm w-full">
                        <span className="text-white font-semibold tracking-wide text-2xl">
                            Login
                        </span>
                    </div>
                    {/* Content */}
                    <div className="my-2 w-10/12">
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
                    </div>
                    <div className="my-2 w-10/12">
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
                    </div>
                    {/* Buttons */}
                    <button
                        className="bg-green-500 text-white rounded-lg text-2xl px-8 py-2 mt-6 shadow-md"
                        onClick={this.login}
                    >
                        Login
                    </button>
                    <p className="mt-6 text-blue-700">
                        <a
                            href="#"
                            onClick={this.navToRegister}
                        >
                            Don't have an account? Register
                        </a>
                    </p>
                    <p className="mt-2 mb-6 text-blue-700">
                        <a
                            href="/reset"
                        >
                            Forgot your password?
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

export default Login;

