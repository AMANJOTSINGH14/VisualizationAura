import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector } from 'react-redux'
const Card = styled.div`
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 320px;
  transition: transform 0.3s;
`;

const Subject = styled.input`
  border: none;
  border-bottom: 2px solid #e0e0e0;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  outline: none;
  padding-bottom: 8px;
  width: 100%;
  transition: border-color 0.3s;

  &:focus {
    border-color: red;
  }
`;

const IconBar = styled.div`
  background-color: whitesmoke;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 16px;
`;

const IconButton = styled.button`
  border: none;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  font-size: 16px;
  height: 32px;
  width: 32px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconArea = styled.div`
  flex-grow: 1;
  background-color: transparent;
  border: none;
  font-size: 14px;
  outline: none;
  padding: 4px;
`;

const TextArea = styled.textarea`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  height: 120px;
  outline: none;
  padding: 12px;
  resize: none;
  width: 90%;
  transition: border-color 0.3s;

  &:focus {
    border-color: #ff4081;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const FooterButton = styled.button`
  background-color: red;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  padding: 10px 20px;
`;

const PublishButton = styled.button`
  background-color: red;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  padding: 10px 20px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 8px;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
`;

const Modal = styled.div.attrs<{ show: boolean }>(({ show }) => ({
  style: {
    display: show ? "block" : "none",
  },
}))<{ show: boolean }>`
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: #fff;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 300px;
  border-radius: 12px;
  text-align: center;
`;

const ModalInput = styled.input`
  width: 90%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

const ModalButton = styled.button`
  background-color: red;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  padding: 10px 20px;

  &:first-child {
    margin-right: 20px;
  }
`;

const CaptionInput = styled.input`
  width: 90%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #ff4081;
  }
`;

interface CardComponentProps {
  initialData?: {
    
    subject: string;
    author: string;
    text: string;
    imageUrl?: string;
    linkUrl?: string;
    caption?: string;
  };
  onSave: (data: {
    subject: string;
    author:string;
    text: string;
    imageUrl?: string;
    linkUrl?: string;
    caption?: string;
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const CardComponent: React.FC<CardComponentProps> = ({
  initialData,
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const user = useSelector((state:any) => state.auth.user);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [text, setText] = useState(initialData?.text || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>("");
  const [modalType, setModalType] = useState<"link" | "image">("link");
  const [captionLink, setCaptionLink] = useState<string>(
    initialData?.linkUrl || ""
  );
  const [author,setAuthor]= useState(user?.name)


  useEffect(() => {
    console.log("dsi",initialData)
    setSubject(initialData?.subject || "");
    setAuthor(initialData?.author || "Anonymous")
    setText(initialData?.text || "");
    setPreviewUrl(initialData?.imageUrl || null);
    setCaptionLink(initialData?.caption || "");
  }, [initialData]);
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLinkClick = () => {
    setModalType("link");
    setModalOpen(true);
  };

  const handleImageLinkClick = () => {
    setModalType("image");
    setModalOpen(true);
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.split("v=")[1];
    if (videoId) {
      const ampersandIndex = videoId.indexOf("&");
      return ampersandIndex !== -1
        ? `https://i.ytimg.com/vi/${videoId.substring(
            0,
            ampersandIndex
          )}/hqdefault.jpg`
        : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
    return null;
  };

  const handleModalSubmit = () => {
    if (inputUrl) {
      if (modalType === "link") {
        if (inputUrl.includes("youtube.com") || inputUrl.includes("youtu.be")) {
          const thumbnail = getYouTubeThumbnail(inputUrl);
          if (thumbnail) {
            setPreviewUrl(thumbnail);
          } else {
            alert("No thumbnail found for the YouTube video.");
          }
        } else {
          fetch(
            `https://api.allorigins.win/get?url=${encodeURIComponent(inputUrl)}`
          )
            .then((response) => response.json())
            .then((data) => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(data.contents, "text/html");
              const imgSrc = doc.querySelector("img")?.src;
              if (imgSrc) {
                setPreviewUrl(imgSrc);
              } else {
                alert("No image found on the website.");
              }
            })
            .catch((error) => {
              console.error("Error fetching image:", error);
              alert("Failed to fetch image from the website.");
            });
        }
      } else if (modalType === "image") {
        const isValidImageUrl = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(
          inputUrl
        );
        const isBase64 = inputUrl.startsWith("data:image/");

        if (isValidImageUrl || isBase64) {
          setPreviewUrl(inputUrl);
        } else {
          alert("Please enter a valid image URL or a base64-encoded image.");
        }
      }
    }
    setModalOpen(false);
  };
  const handleSave = () => {
    onSave({
      subject,
      author,
      text,
      imageUrl: previewUrl || undefined,
      linkUrl: inputUrl || undefined,
      caption: captionLink || undefined,
    });
  };
  return (
    <>
      <Card>
        <Subject
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        {previewUrl ? (
          <>
            <ImagePreviewContainer>
              <ImagePreview src={previewUrl} alt="Preview" />
              <RemoveButton onClick={handleRemoveImage}>Remove</RemoveButton>
            </ImagePreviewContainer>
            <CaptionInput
              placeholder="Add a caption"
              value={captionLink}
              onChange={(e) => setCaptionLink(e.target.value)}
            />
          </>
        ) : (
          <IconBar>
            <IconButton
              style={{ backgroundColor: "#e6e6fa" }}
              onClick={handleFileClick}
            >
              <span style={{ fontSize: "18px" }}>📄</span>
            </IconButton>
            <IconButton
              style={{ backgroundColor: "#e6e6fa" }}
              onClick={handleLinkClick}
            >
              <span style={{ fontSize: "18px" }}>🔗</span>
            </IconButton>
            <IconButton
              style={{ backgroundColor: "#e6e6fa" }}
              onClick={handleImageLinkClick}
            >
              <span style={{ fontSize: "18px" }}>🌐</span>
            </IconButton>
            <IconArea />
          </IconBar>
        )}
        <TextArea
          placeholder="Type something..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Footer>
          <FooterButton onClick={onCancel}>Cancel</FooterButton>
          <PublishButton onClick={handleSave}>
            {isEditing ? "Update" : "Add"}
          </PublishButton>
        </Footer>
      </Card>
      <HiddenFileInput
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
      />
      <Modal show={modalOpen}>
        <ModalContent>
          <h2>{modalType === "link" ? "Enter Link" : "Enter Image URL"}</h2>
          <ModalInput
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              modalType === "link"
                ? "Example - https://www.youtube.com"
                : "Example - https://example.com/image.jpg"
            }
          />
          <div>
            <ModalButton onClick={handleModalSubmit}>Add</ModalButton>
            <ModalButton onClick={() => setModalOpen(false)}>
              Cancel
            </ModalButton>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CardComponent;
