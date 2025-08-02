import React from 'react';
import { MainButton } from '@twa-dev/sdk/react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Home Page</h1>
            <MainButton text="Go to Second Page" onClick={() => navigate('/second')} />
        </div>
    );
}

export default HomePage;