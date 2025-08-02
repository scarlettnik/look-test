import React, { useMemo, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentIndex,
  setLastDirection,
  addToDismatch,
  addToMatch,
  addToQueryMatch,
  removeCard,
} from '../features/cardSlice';
import styles from './ui/card.module.css';

function Card() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDoubleClick = (character) => {
    navigate(`/product/${character.id}`, {
      state: { product: character },
    });
  };

  const { db, currentIndex, lastDirection } = useSelector((state) => state.card);

  const currentIndexRef = useRef(currentIndex);

  if (currentIndexRef.current === 0 && db.length > 0) {
    currentIndexRef.current = db.length - 1;
    dispatch(setCurrentIndex(db.length - 1));
  }

  const childRefs = useMemo(
      () =>
          Array(db.length)
              .fill(0)
              .map(() => React.createRef()),
      [db.length]
  );

  const updateCurrentIndex = (val) => {
    dispatch(setCurrentIndex(val));
    currentIndexRef.current = val;
  };

  const canSwipe = currentIndex >= 0;

  const swiped = (direction, nameToDelete, index) => {
    dispatch(setLastDirection(direction));
    const card = db[index];

    setTimeout(() => {
      dispatch(removeCard(card.id));
      updateCurrentIndex(index - 1);
    }, 500);

    if (direction === 'left') {
      dispatch(addToDismatch(card));
    } else if (direction === 'right') {
      dispatch(addToMatch(card));
    } else if (direction === 'down') {
      dispatch(addToQueryMatch(card));
    }
  };

  const outOfFrame = (name, idx) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
  };

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < db.length) {
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  return (
      <div className={styles.mainCard}>
        <div className={styles.card}>
          {db.map((character, index) => (
              <TinderCard
                  ref={childRefs[index]}
                  key={character.id}
                  className={styles.swipe}
                  onSwipe={(dir) => swiped(dir, character.name, index)}
                  onCardLeftScreen={() => outOfFrame(character.name, index)}
                  swipeThreshold={0.2}
              >
                <div className={`${styles.card} pressable`} onDoubleClick={() => handleDoubleClick(character)}>
                  <div style={{ display: 'flex' }}>
                    <div>{character.name}</div>
                    <div className={styles.cardContent}>{character?.position}</div>
                    <div className={styles.cardContent}>{character?.experience}</div>
                  </div>
                  <div className={styles.achive}>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {character.skills &&
                          character.skills.map((item, index) => (
                              <div style={{ margin: '1em' }} key={index}>
                                {item}
                              </div>
                          ))}
                    </div>
                  </div>
                  <div className={styles.cardContent}>Описание: {character.description || 'Данные не указаны'}</div>
                  <div>
                    <Link
                        to={`/product/${character.id}`}
                        state={{ product: character, currentIndex }}
                        className={`${styles.linkStyle} pressable`}
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </TinderCard>
          ))}
        </div>
        <div className={styles.buttonlist}>
          <button onClick={() => swipe('left')}>left</button>
          <button onClick={() => swipe('down')}>down</button>
          <button onClick={() => swipe('right')}>right</button>
        </div>
        {lastDirection ? (
            <h2 key={lastDirection}>You swiped {lastDirection}</h2>
        ) : (
            <h2 className='infoText'>Swipe</h2>
        )}
      </div>
  );
}

export default Card;