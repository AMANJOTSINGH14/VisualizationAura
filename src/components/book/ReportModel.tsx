import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { reportCardAsync } from '../../store/userSlice';

interface ReportModalProps {
  onClose: () => void;
  cardId: string | null;
  userEmail: string | null;
}

const ReportModalOverlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 1001;
`;

const ReportModalContent = styled.div`
  background: white;
  border-radius: 10px 0 0 10px;
  width: 350px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
  font-family: 'Arial', sans-serif;
`;

const ReportOption = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  padding: 10px 0;
  text-align: left;
  width: 100%;
  cursor: pointer;
  color: #333;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  background-color: #ff4081;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e23371;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  margin-top: 20px;
  border-radius: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  font-size: 14px;
  resize: none;
  font-family: 'Arial', sans-serif;

  &::placeholder {
    color: #bbb;
  }
`;

const SelectedOption = styled.p`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
`;

const CardInfo = styled.div`
  margin-bottom: 20px;
`;

const CardID = styled.p`
  font-size: 14px;
  color: #555;
  margin: 0;
`;

const ReportingFor = styled.p`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-top: 5px;
`;

const ReportModal: React.FC<ReportModalProps> = ({ onClose, cardId, userEmail }) => {
  const dispatch = useDispatch();
  const [reportType, setReportType] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
console.log(cardId);
const handleSubmit = () => {
  console.log(cardId,reportType,additionalInfo,"ppk",userEmail)
  if (cardId && reportType && additionalInfo  && userEmail) {
    dispatch(
      reportCardAsync({
        id: cardId,
        email: userEmail,
        reportType,
        additionalInfo,
      }) as any
    );
    onClose();
  } else {
    alert('⚠️ Please select a report type and add details.');
  }
};


  return (
    <ReportModalOverlay onClick={onClose}>
      <ReportModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <h2>Report post</h2>
        <p>
          <strong>Card ID:</strong> {cardId}
        </p>
        {reportType && (
          <ReportingFor>
            <strong>Reporting for:</strong> {reportType}
          </ReportingFor>
        )}

        <ReportOption onClick={() => setReportType('Child abuse')}>Child abuse</ReportOption>
        <ReportOption onClick={() => setReportType('Self-harm')}>Self-harm</ReportOption>
        <ReportOption onClick={() => setReportType('Spam or fraud')}>Spam or fraud</ReportOption>
        <ReportOption onClick={() => setReportType('Bullying')}>Bullying</ReportOption>
        <ReportOption onClick={() => setReportType('Sale of illegal goods')}>Sale of illegal goods</ReportOption>
        <ReportOption onClick={() => setReportType('Intellectual property violation')}>
          Intellectual property violation
        </ReportOption>
        <ReportOption onClick={() => setReportType('Something else')}>Something else</ReportOption>

        <TextArea
          placeholder="Add additional information"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
        />

        <SubmitButton onClick={handleSubmit}>Submit Report</SubmitButton>
      </ReportModalContent>
    </ReportModalOverlay>
  );
};

export default ReportModal;
