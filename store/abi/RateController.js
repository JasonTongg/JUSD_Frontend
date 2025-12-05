export const ratecontroller = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_myUSD",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_staking",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setBorrowRate",
        "inputs": [
            {
                "name": "newRate",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setSavingsRate",
        "inputs": [
            {
                "name": "newRate",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "error",
        "name": "Engine__InvalidBorrowRates",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Staking__InvalidSavingsRate",
        "inputs": []
    }
]