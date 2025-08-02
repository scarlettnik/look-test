import TinderCard from "../TinderCard.jsx";
import '../ui/TinderCards.css';

export const CardStack = ({
                              cards,
                              onSwipe,
                              updateSwipeFeedback,
                              expandedCardId,
                              onExpand,
                              onCollapse
                          }) => (
    <div className="tinder--cards">
        {cards.map((card, index) => (
            <TinderCard
                key={card._key}
                card={card}
                onSwipe={onSwipe}
                updateSwipeFeedback={updateSwipeFeedback}
                zIndex={cards.length - index}
                offset={index}
                isExpanded={expandedCardId === card.id}
                onExpand={onExpand}
                onCollapse={onCollapse}
                isPending={card._pending}
            />
        ))}
        {cards.length === 0 && (
            <div className="empty-state">
                <h2>No more cards!</h2>
            </div>
        )}
    </div>
);