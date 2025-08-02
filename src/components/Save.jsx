import styles from "./ui/save.module.css";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import FullScreenButton from "./FullScrinButton.jsx";
import ButtonWrapper from "./utils/ButtonWrapper.jsx";
import Modal from "./utils/Modal.jsx";
import AddList from "./AddList.jsx";
import {observer} from "mobx-react-lite/src";
import { useStore } from '../provider/StoreContext.jsx';
import CustomCheckbox from "./CustomCheckbox.jsx";

const Save = observer(() => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedSaves, setSelectedSaves] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const store = useStore();

  const containerRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const newHeight = window.visualViewport.height;
      const keyboardHeight = window.innerHeight - newHeight;
      setKeyboardHeight(keyboardHeight > 100 ? keyboardHeight : 0);

      if (containerRef.current) {
        containerRef.current.style.height = `${newHeight}px`;
      }
    };

    const handleScroll = () => {
      const activeElement = document.activeElement;
      if (activeElement?.tagName === "INPUT") {
        activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  console.log(store)
  const filteredSaves = store?.authStore?.data?.collections?.filter((save) =>
    save.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const toggleSaveSelection = (id) => {
    if (selectedSaves.includes(id)) {
      setSelectedSaves(selectedSaves.filter((saveId) => saveId !== id));
    } else {
      setSelectedSaves([...selectedSaves, id]);
    }
  };

  const deleteOpen = () => {
    setIsModalOpen(false);
    setDeleteMode(!deleteMode);
  };
  const createOpen = () => {
    setDeleteMode(false);
    setIsModalOpen(true);
  };
  const createClose = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    const originalCollections = [...store.authStore.data.collections];

    store.authStore.data.collections = originalCollections.filter(
        collection => !selectedSaves.includes(collection.id)
    );

    setSelectedSaves([]);
    setDeleteMode(false);

    try {
      await store.collectionStore.deleteCollections(selectedSaves);

    } catch (error) {
      store.authStore.data.collections = originalCollections;
      console.error('Delete failed:', error);
    }
  };
  const handleCreateCollection = async (name, coverUrl) => {
    if (!name.trim()) return;
    setIsModalOpen(false);
    try {
      const newCollection = await store.collectionStore.createCollection(name, coverUrl);
    } catch (error) {
      console.error('Create failed:', error);
      alert('Не удалось создать коллекцию. Попробуйте снова.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <>
      <div
        ref={containerRef}
        className={styles.container}
        style={{
          height: `${window.innerHeight}px`,
          paddingBottom: keyboardHeight > 0 ? keyboardHeight : 0,
        }}
      >
        <div className={styles.searchBar}>
          <div className={styles.searchContainer}>
            <span className={styles.searchIcon}>
              <img src="/subicons/search.svg" />
            </span>
            <input
              type="text"
              placeholder="Search for a wishlist..."
              className={styles.input}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <div className={styles.buttons}>
            <button className={styles.circleButton} onClick={createOpen}>
              <img src="/subicons/plus.svg" />
            </button>
            <button className={styles.circleButton} onClick={deleteOpen}>
              <img src="/subicons/minus.svg" />
            </button>
          </div>
        </div>

        <div
          className={styles.cards}
          style={{ marginBottom: deleteMode ? "120px" : "0px" }}
        >
          {filteredSaves?.map((save) => (
              <div key={save.id} className={styles.cardContainer}>
                {deleteMode && (
                   <div>
                     <CustomCheckbox
                         id={`save-${save.id}`}
                         checked={selectedSaves.includes(save.id)}
                         onChange={() => toggleSaveSelection(save.id)}
                         className={styles.checkBox}
                     />
                   </div>
                )}
                <Link to={`/save/${save.id}`}>
                  <div className={styles.card}>
                    <img
                        src={save.cover_image_url}
                        className={styles.image}
                    />
                  </div>
                  <h3 className={styles.cardTitle}>
                    {save.name.toUpperCase() === "__FAVOURITES__" ? 'Все избранное' : save.name}
                  </h3>
                </Link>
              </div>
          ))}
        </div>
        <Modal isOpen={isModalOpen} onClose={createClose}>
          <AddList onCreate={handleCreateCollection} />
        </Modal>
      </div>
      {deleteMode && (
        <div style={{ position: "sticky" }}>
          <ButtonWrapper>
            <FullScreenButton
              className={styles.cancelButton}
              onClick={() => {
                setDeleteMode(false);
                setSelectedSaves([]);
              }}
              color="var(--light-gray)"
              textColor="var(--black)"
            >
              Отменить
            </FullScreenButton>
            <FullScreenButton
              className={styles.deleteButton}
              onClick={handleDelete}
              disabled={selectedSaves.length === 0}
            >
              Удалить {selectedSaves.length > 0 && selectedSaves.length}
            </FullScreenButton>
          </ButtonWrapper>
        </div>
      )}
      <Sidebar />
    </>
  );
});

export default Save;
