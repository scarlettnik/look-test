const FullScreenButton = ({
                          children,
                          color = "var(--black)",
                          textColor = "var(--white)",
                          onClick
                      }) => {
    const buttonStyle = {
        backgroundColor: color,
        color: textColor,
        width: '96vw',
        padding: "12px 24px",
        borderRadius: "30px",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "500",
        bottom: "20px",
        zIndex: 1000,
        marginBottom: "10px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",

    };

    return (
        <button style={buttonStyle} onClick={onClick}>
            {children}
        </button>
    );
};

export default FullScreenButton;