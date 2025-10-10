import React, { useState,useEffect } from 'react';
import styled from 'styled-components';
import CardComponent from './Card';
import CList from './CList';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import ReportModal from './ReportModel';
import { useSelector, useDispatch } from 'react-redux'
import { getAllCards, addCard, editCard, removeCard,duplicateExistingCard } from '../../store/userSlice';
import { RootState, AppDispatch } from '../../store';
const BookContainer = styled.div`
  padding: 20px;
  position: relative;
`;

const AddCardButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ff4081;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index:100;
`;

const ModalOverlay = styled.div`
  position: fixed;
  border: 4px solid black;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px 10px 0 0;
  width: auto;
  margin-bottom: 0;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;
const UploadConfig = styled.button`
  position: fixed;
  bottom: 20px;
  right: 90px;
  background-color: #ff4081;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const UploadConfig2 = styled.button`
  position: fixed;
  bottom: 20px;
  right: 160px; /* move further to the left than the first one */
  background-color: #4CAF50;  /* different color */
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface CardData {
  _id?: string;
  author: string;
  subject: string;
  imageUrl?: string;
  text: string;
  caption: string;
  tags?: string[];
}
const Canvas = () => {
  const dispatch: AppDispatch = useDispatch();
  const user = useSelector((state:any) => state.auth.user);
  // const [cards, setCards] = useState<CardData[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCardId, setReportCardId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const handleModalOpen = () => {
    setEditingCardId(null);
    setIsModalOpen(true);
  };
  const uniqueTags = new Set<string>(["Tag1", "Tag2", "Tag3", "Tag4", "tag5"]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

  // useEffect(() => {
  //   const savedCards = localStorage.getItem('cards');
  //   if (savedCards) {
  //     setCards(JSON.parse(savedCards));
  //   }
  // }, [])
  const { cards, loading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(getAllCards());
  }, [dispatch]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCardId(null);
  };
  const handleEdit = (cardId: string) => {
    console.log(cardId,"dssdsdaaaa",cards)
    setEditingCardId(cardId);
    setIsModalOpen(true);
  };
  
  const handleReportModalOpen = (cardId: string, cardAuthor: string) => {
    console.log(user)
    if (cardAuthor === user?.email) {
      alert("❌ You cannot report your own card.");
      return;
    }
    setReportCardId(cardId);
    setIsReportModalOpen(true);
  };

  const handleReportModalClose = () => {
    setIsReportModalOpen(false);
    setReportCardId(null);
  };
  const handleSave = async (data: {
    subject: string;
    text: string;
    imageUrl?: string;
    caption?: string;
    tags?: string[];
  }) => {
    if (editingCardId) {
      const updatedCard = {
        ...cards.find((card) => card._id === editingCardId),
        subject: data.subject,
        text: data.text,
        imageUrl: data.imageUrl,
        caption: data.caption || '',
        tags:data.tags ??[]
      };
      
      await dispatch(editCard({ id: editingCardId, data: updatedCard}));
      // localStorage.setItem('cards', JSON.stringify(updatedCards));

    } else {
      const newCard: CardData = {
        author: user?.name || 'Anonymous',
        subject: data.subject,
        text: data.text,
        imageUrl: data.imageUrl,
        caption: data.caption || '',
        tags: [],
      };
       await dispatch(addCard(newCard));
      // const updatedCards = [...cards, newCard];
      // setCards(updatedCards);
      // localStorage.setItem('cards', JSON.stringify(updatedCards));
    }
    setIsModalOpen(false);
    setEditingCardId(null);
    dispatch(getAllCards())
  };


  const handleTagDrop = async (cardId: string, tagName: string) => {
    const existingCard = cards.find((card) => card._id === cardId);
    setEditingCardId(cardId); 
    if (!existingCard) return;
    
    const newTags = Array.from(new Set([...(existingCard.tags || []), tagName]));
    console.log(newTags);
    console.log(existingCard);
    
    const updatedCard = {
      ...existingCard,
      tags: newTags,
    };
    
    console.log(updatedCard, cardId, "handletag");
    await dispatch(editCard({ id: cardId, data: updatedCard }));
    dispatch(getAllCards())
  };
  
  const handleDuplicate = async(cardId: string) => {
    // setCards((prevCards) => {
    //   const cardToDuplicate = prevCards.find((card) => card.id === cardId);
    //   if (cardToDuplicate) {
    //     const newCard = {
    //       ...cardToDuplicate,
    //       id: Date.now().toString(),
    //     };
    //     return [...prevCards, newCard];
    //   }
    //   return prevCards;
    // });
    await dispatch(duplicateExistingCard(cardId));
   dispatch(getAllCards())
  };
  const handleDelete = async (cardId: string) => {
    // setCards((prevCards) => {
    //   const updatedCards = prevCards.filter((card) => card.id !== cardId);
    //   localStorage.setItem('cards', JSON.stringify(updatedCards));
    //   return updatedCards;
    // });
   await dispatch(removeCard(cardId));
   dispatch(getAllCards())
  };


const TAGS_CSV_RAW =
  "https://raw.githubusercontent.com/AMANJOTSINGH14/VisualizationAura/main/files/List%20of%20Tags.xlsx%20-%20Tag-MisinformedbyVisualization.csv";

const CHART_TYPES_XLSX_RAW =
  "https://raw.githubusercontent.com/AMANJOTSINGH14/VisualizationAura/main/files/chart_types.xlsx";

async function fetchAsText(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

async function fetchAsArrayBuffer(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.arrayBuffer();
}

const fetchTagsFromGitHub = async () => {
  try {
    const csvText = await fetchAsText(TAGS_CSV_RAW);

    Papa.parse(csvText, {
      header: true,
      complete: (results: any) => {
        const uniq = new Set<string>();
        results.data.forEach((row: any) => {
          if (row && typeof row['Tags'] !== 'undefined' && row['Tags'] !== null && `${row['Tags']}`.trim() !== '') {
            uniq.add(String(row['Tags']).trim());
          }
        });
        setUniqueCategories(Array.from(uniq));
      },
      error: (error: any) => {
        console.error('Error parsing remote CSV:', error);
        alert('Error parsing remote CSV. See console for details.');
      },
    });
  } catch (err) {
    console.error(err);
    alert(`Could not fetch Tags CSV from GitHub.`);
  }
};

const fetchChartTypesFromGitHub = async () => {
  try {
    const ab = await fetchAsArrayBuffer(CHART_TYPES_XLSX_RAW);
    const workbook = XLSX.read(ab, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet); 

    const uniq = new Set<string>();
    jsonData.forEach((row: any) => {
      if (row && typeof row['Chart Types'] !== 'undefined' && row['Chart Types'] !== null && `${row['Chart Types']}`.trim() !== '') {
        uniq.add(String(row['Chart Types']).trim());
      }
    });
    setUniqueCategories(Array.from(uniq));
  } catch (err) {
    console.error(err);
    alert(`Could not fetch chart_types.xlsx from GitHub.`);
  }
};

  return (
    <BookContainer>
         <CList
        cards={cards }
        author={user?.name || 'Anonymous'}
        onEdit={handleEdit}
        onTagDrop={handleTagDrop}
        onReport={(cardId, cardAuthor) => handleReportModalOpen(cardId, cardAuthor)}

        onDuplicate={handleDuplicate} 
        onDelete={handleDelete}
        tags={uniqueCategories}      />
        {isReportModalOpen && (
        <ReportModal
        onClose={() => setIsReportModalOpen(false)}
        cardId={reportCardId}
        userEmail={user?.email || ""}
      />
      )}
      <AddCardButton onClick={handleModalOpen}>➕</AddCardButton>

      <UploadConfig2 onClick={fetchChartTypesFromGitHub} title="Load chart types from GitHub">
  📄
</UploadConfig2>

<UploadConfig onClick={fetchTagsFromGitHub} title="Load tags from GitHub">
  📁
</UploadConfig>

      {isModalOpen && (
        <ModalOverlay onClick={handleModalClose}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={handleModalClose}>&times;</CloseButton>
            <CardComponent
              initialData={
                editingCardId
                  ? cards.find((card) => card._id === editingCardId)
                  : undefined
              }
              onSave={handleSave}
              onCancel={handleModalClose}
              isEditing={!!editingCardId}
            />
          </ModalContent>
        </ModalOverlay>
      )}
    </BookContainer>
  );
};

export default Canvas;