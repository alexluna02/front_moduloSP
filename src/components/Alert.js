// src/components/CustomAlert.jsx
import React from 'react';
import { Alert } from 'antd';

const CustomAlert = ({ type = 'info', message, description, onClose }) => {
    if (!message && !description) return null;

    return (
        <Alert
            message={message}
            description={description}
            type={type}
            showIcon
            closable
            onClose={onClose}
            style={{ marginBottom: '20px' }}
        />
    );
};

export default CustomAlert;