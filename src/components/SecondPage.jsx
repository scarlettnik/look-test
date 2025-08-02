import React from 'react';
import { MainButton } from '@twa-dev/sdk/react';
import { useNavigate } from 'react-router-dom';

function SecondPage() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Second Page</h1>
            <MainButton text="Go Back to Home" onClick={() => navigate('/')} />
        </div>
    );
}

export default SecondPage;