import React from 'react';
import fetchData from '../fetchData';

class Verification extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            verified: false,
            error: false
        }
    }

    componentDidMount = async () => {
        try {
            const res = await fetchData('POST', `auth/verification/${this.props.match.params.hash}`);
            if (res.status === 200) {
                this.setState({
                    verified: true
                });
            } else {
                this.setState({
                    error: true
                });
            }
        } catch (err) {
            this.setState({
                error: true
            });
        }
    }

    render() {
        return (
            <>
                {(this.state.verified) &&
                    <>
                        <div className="flex justify-center items-center mt-8 mx-8">
                            <span className="text-2xl text-gray-800">
                                Your account has been verified!
                            </span>
                        </div>
                        <div className="flex justify-center items-center mt-4">
                            <a href="/login" className="text-lg text-gray-800 underline">
                                Return to Home
                            </a>
                        </div>
                    </>
                }
                {(this.state.error) &&
                    <div className="flex justify-center items-center mt-8 mx-8">
                        <span className="text-2xl text-gray-800">
                            This verification code has expired. Please request another verification e-mail and try again.
                        </span>
                    </div>
                }
            </>
        );
    }
}

export default Verification;

