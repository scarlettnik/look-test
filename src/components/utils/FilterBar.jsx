import styles from '../ui/product.module.css';
import {ChevronDown, SlidersHorizontal, Undo2} from "lucide-react";

export const FilterBar = ({onUndo, undoDisabled, highlightUndo}) => (
    <div className={styles.filterBar}>
        <button
            onClick={onUndo}
            disabled={undoDisabled}
            className={`${styles.backButton} ${highlightUndo ? styles.highlightedButton : ''}`}
        >
            <Undo2/>
        </button>
        <button className={styles.filterButton}>
            <SlidersHorizontal size={18}/>
        </button>
        {['Sale', 'Brand', 'Product', 'Color'].map((text, idx) => (
            <button key={idx} className={styles.filterButton}>
                {text}
                {idx > 0 && <ChevronDown size={18}/>}
            </button>
        ))}
    </div>
);