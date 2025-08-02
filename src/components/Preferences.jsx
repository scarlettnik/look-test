import { useState } from 'react';
import './ui/preferences.css';

const images = [
    { name: 'Image 1', url: 'https://i.pinimg.com/736x/61/a7/1b/61a71be7fb1e89ce0f3cbb4c5e1023fa.jpg' },
    { name: 'Image 2', url: 'https://i.pinimg.com/736x/61/a7/1b/61a71be7fb1e89ce0f3cbb4c5e1023fa.jpg' },
    { name: 'Image 3', url: 'https://i.pinimg.com/736x/61/a7/1b/61a71be7fb1e89ce0f3cbb4c5e1023fa.jpg' },
    { name: 'Image 4', url: 'https://i.pinimg.com/736x/61/a7/1b/61a71be7fb1e89ce0f3cbb4c5e1023fa.jpg' },
];

const Preferences = () => {
    const [selectedItems, setSelectedItems] = useState([]);

    const handleImageClick = (imageName) => {
        setSelectedItems(prev => {
            const newSelection = prev.includes(imageName)
                ? prev.filter(name => name !== imageName)
                : [...prev, imageName];

            console.log('Selected items:', newSelection); // Вывод в консоль
            return newSelection;
        });
    };

    return (
        <div className="image-grid">
            {images.map((image) => (
                <div
                    key={image.name}
                    className="image-container"
                    onClick={() => handleImageClick(image.name)}
                >
                    <img
                        src={image.url}
                        alt={image.name}
                        className="image-item"
                    />
                    {selectedItems.includes(image.name) && (
                        <div className="checkmark">✓</div>
                    )}
                    <div className="image-name">{image.name}</div>
                </div>
            ))}
        </div>
    );
};

export default Preferences;