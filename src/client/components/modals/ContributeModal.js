import React from 'react';
import { toast } from 'react-toastify';
import qr from 'qr-image';
import CloseIcon from '../icons/CloseIcon';

class ContributeModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const btcStr = `bitcoin:${this.props.address}?amount=${this.props.amount}`;
        const qrImg = qr.imageSync(btcStr);
        const qrData =  `data:image/png;base64,${qrImg.toString('base64')}`;

        return (
            <div className="w-full h-full fixed top-0 left-0 flex items-center text-center">
                <div
                    className="absolute w-full h-full bg-gray-900 opacity-50 cursor-pointer"
                    onClick={this.props.onClose}
                ></div>
                <div
                    className="bg-white w-1/2 rounded z-50 mx-auto flex flex-col justify-center"
                >
                    {/* Close Icon */}
                    <div
                        className="flex justify-end items-center cursor-pointer m-2"
                        onClick={this.props.onClose}
                    >
                        <CloseIcon
                            size={6}
                        />
                    </div>
                    <p className="text-3xl mt-2">Contribute BTC</p>
                    <p className="text-3xl mt-2 text-red-500">DEMO ONLY - DO NOT SEND</p>
                    <div className="mt-2 flex justify-center">
                        <img src={qrData} />
                    </div>
                    <p className="text-lg mt-4 mb-8 px-4">Scan to fund this project with Bitcoin. The project maintainer uses these funds to reward people who contribute to this project through pull requests.</p>
                </div>
            </div>
        );
    }
}

export default ContributeModal;

