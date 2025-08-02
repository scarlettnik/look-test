const ButtonWrapper = ({children}) => {
    const wrapperStyle = {
        position: 'fixed',
        bottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1001,
        left: 0,
        right: 0,

    };

    return (
        <div style={wrapperStyle}>
            {children}
        </div>
    );
};

export default ButtonWrapper;