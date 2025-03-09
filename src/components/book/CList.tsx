import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaSearch, FaChartBar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface CListProps {
  cards: any;
  author: string;
  onReport: (cardId: string, cardAuthor:string) => void;
  onEdit: (cardId: string) => void;
  onTagDrop: (cardId: string, tagName: string) => void;
  onDuplicate: (cardId: string) => void;
  onDelete: (cardId: string) => void;
  tags: string[];
}

interface CardData {
  _id: string;
  author: string;
  subject: string;
  imageUrl?: string;
  linkUrl?: string;
  text: string;
  caption: string;
  tags?: string[];
}

interface Tag {
  id: string;
  name: string;
}

const Header = styled.header<{ sidebarExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ff4081;
  padding: 16px 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: calc(100% - 420px);
  top: 0;
  z-index: 1000;
  width: ${(props) =>
    props.sidebarExpanded ? "calc(100% - 420px)" : "calc(100% - 120px)"};
  transition: width 0.3s ease;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

const LogoIcon = styled(FaChartBar)`
  margin-right: 12px;
  font-size: 28px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 8px 16px;
`;

const SearchInput = styled.input`
  background: none;
  border: none;
  color: #333;
  font-size: 14px;
  outline: none;
  width: 200px;

  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #999;
  margin-right: 8px;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  padding: 8px 16px;
  border-radius: 20px;
`;

const UserName = styled.span`
  margin-right: 8px;
  font-size: 16px;
  color: #d81b60;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background-color: #ff4081;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavLink = styled.a`
  font-size: 16px;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
    color: #e0f4ff;
  }
`;

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  padding-top: 80px;
`;

const CardListContainer = styled.div<{ sidebarExpanded: boolean }>`
  padding: 24px;
  max-width: ${(props) => (props.sidebarExpanded ? "1110px" : "1350px")};
  margin: 0 auto;
  height: calc(100vh - 80px);
  overflow-y: auto;
  transition: max-width 0.3s ease;
`;

const CardList = styled.div<{ sidebarExpanded: boolean }>`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(${(props) => (props.sidebarExpanded ? "250px" : "250px")}, 1fr)
  );
  gap: 24px;
  transition: all 0.3s ease;
`;

const Card = styled.div<{ expanded: boolean }>`
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  height: ${(props) => (props.expanded ? "auto" : "300px")};

  &:hover {
    transform: translateY(-4px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f0f4f8;
  font-weight: bold;
  font-size: 16px;
`;

const CardContent = styled.div<{ expanded: boolean }>`
  padding: 16px;
  flex-grow: 1;
  overflow: ${(props) => (props.expanded ? "auto" : "hidden")};
  max-height: ${(props) => (props.expanded ? "500px" : "auto")};
`;

const CardSubject = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
`;

const CardImage = styled.img<{ expanded: boolean }>`
  width: 100%;
  height: ${(props) => (props.expanded ? "250px" : "100px")};
  object-fit: cover;
  margin-bottom: 8px;
  border-radius: 8px;
  transition: height 0.3s ease;
  cursor: pointer;
`;

const CardLink = styled.a`
  display: block;
  margin-bottom: 8px;
  color: #0066cc;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
    color: #004999;
  }
`;

const CardText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #555;
  display: block;
  overflow: hidden;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const Tag = styled.span`
  background-color: #e0f7fa;
  color: #00796b;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 8px;
`;

const CollapseButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #f0f4f8;
  border: none;
  border-top: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #0066cc;

  &:hover {
    background-color: #e0e4e8;
  }
`;

const Sidebar = styled.div<{ expanded: boolean }>`
  width: ${(props) => (props.expanded ? "300px" : "0")};
  height: 100vh;
  position: fixed;
  right: 0;
  top: 0;
  background-color: #fff;
  padding: ${(props) => (props.expanded ? "24px" : "0")};
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  overflow: hidden;
`;

const MainContent = styled.div<{ sidebarExpanded: boolean }>`
  flex-grow: 1;
  margin-right: ${(props) => (props.sidebarExpanded ? "300px" : "0")};
  transition: margin-right 0.3s ease;
`;

const SidebarHeader = styled.div`
  margin-bottom: 24px;
`;

const SidebarTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
`;

const CountDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const CountItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CountLabel = styled.span`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const CountValue = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const PopularTag = styled.div`
  background-color: #ff4081;
  color: #fff;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 24px;
`;

const TagList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const TagItem = styled.div`
  padding: 12px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: move;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const TagName = styled.span`
  font-weight: bold;
  color: #333;
`;

const TagCount = styled.span`
  float: right;
  background-color: #e0e0e0;
  color: #666;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
`;

const ToggleSidebarButton = styled.button<{ expanded: boolean }>`
  position: fixed;
  right: ${(props) => (props.expanded ? "320px" : "0")};
  top: 50%;
  transform: translateY(-50%);
  background-color: #ff4081;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 1001;
  transition: right 0.3s ease;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 40px;
  right: 16px;
  background-color: #f0f4f8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 1000;
  width: 160px;
  display: flex;
  flex-direction: column;
`;

const DropdownItem = styled.button`
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  color: #333;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const EditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #777;
  padding: 0;

  &:hover {
    color: #333;
  }
`;
const CardCaption = styled.p`
  font-size: 10px; /* Very small text */
  color: #888; /* Light grey color */
  margin-top: 4px;
  margin-bottom: 8px;
`;

const CList: React.FC<CListProps> = ({
  cards,
  author,
  onEdit,
  onTagDrop,
  onReport,
  onDuplicate,
  onDelete,
  tags,
}) => {
  console.log(cards);
  const navigate = useNavigate();
  const [internalCards, setInternalCards] = useState<CardData[]>(cards);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);
  const [signup, setSignup] = useState<string | null>(null);
  const [tag, setTags] = useState<Tag[]>(
    tags.map((tagName, index) => ({
      id: (index + 1).toString(),
      name: tagName,
    }))
  );

  useEffect(() => {
    setInternalCards(cards);
  }, [cards]);
  useEffect(() => {
    setTags(
      tags.map((tagName, index) => ({
        id: (index + 1).toString(),
        name: tagName,
      }))
    );
    setSignup(author);
  }, [tags, author]);

  const handleReportClick = (cardId: string, cardAuthor: string) => {
    onReport(cardId, cardAuthor); // ✅ Passes both `cardId` and `cardAuthor`
    setDropdownVisible(null);
  };
  
  const toggleDropdown = (cardId: string) => {
    setDropdownVisible(dropdownVisible === cardId ? null : cardId);
  };

  const handleExpandClick = (cardId: string) => {
    setExpandedCardId((prevId) => (prevId === cardId ? null : cardId));
  };

  const handleDelete = (cardId: string) => {
    console.log(cardId)

    // setInternalCards(internalCards.filter((card) => card.id !== cardId));
    onDelete(cardId)
  };

  const handleDuplicate = (cardId: string) => {
    console.log(cardId)
    onDuplicate(cardId);
    setDropdownVisible(null);
  };

  const handleEditClick = (cardId: string) => {
    onEdit(cardId);
    setDropdownVisible(null);
  };

  const tagCount = tag?.length || 0;
  const cardCount = internalCards?.length || 0;

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === "tagList" &&
      destination.droppableId.startsWith("card-")
    ) {
      const cardId = destination.droppableId.split("-")[1];
      const draggedTag = tag.find((tag) => tag.id === draggableId);

      if (draggedTag) {
        setInternalCards((prevCards) =>
          prevCards.map((card) =>
            card._id === cardId
              ? {
                  ...card,
                  tags: Array.from(
                    new Set([...(card.tags || []), draggedTag.name])
                  ),
                }
              : card
          )
        );
      }
    }
  };

  const sanitizeUrl = (url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      return `http://${url}`;
    }
    return url;
  };
  const handleAuthAction = () => {
    if (signup === "Anonymous") {
      navigate("/");
    } else {
      navigate("/");
    }
  };
  const handleImageClick = (linkUrl?: string) => {
    if (linkUrl) {
      if (linkUrl.startsWith("data:image")) {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`<img src="${linkUrl}" />`);
          newWindow.document.title = "Image Preview";
          newWindow.document.close();
        }
      } else {
        window.open(linkUrl, "_blank");
      }
    }
  };

  const formatCaptionWithLinks = (caption: string): JSX.Element[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = caption.split(urlRegex);

    return parts.map((part: string, index: number) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0066cc" }}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      <Header sidebarExpanded={isSidebarExpanded}>
        <Logo>
          <LogoIcon />
          Vizulaization
        </Logo>
        <HeaderRight>
          <SearchBar>
            <SearchIcon />
            <SearchInput placeholder="Search..." />
          </SearchBar>
          <Nav>
            <NavLink onClick={handleAuthAction}>
              {signup === "Anonymous" ? "Signup" : "Logout"}
            </NavLink>{" "}
          </Nav>
          <UserProfile>
            <UserName> {author}</UserName>
            <UserAvatar>
              {author
                ? author
                    .split(" ") 
                    .map((part) => part[0]) 
                    .join("") 
                    .toUpperCase() 
                : "A"}{" "}
              {}
            </UserAvatar>
          </UserProfile>
        </HeaderRight>
      </Header>
      <PageContainer>
        <DragDropContext onDragEnd={onDragEnd}>
          <MainContent sidebarExpanded={isSidebarExpanded}>
            <CardListContainer sidebarExpanded={true}>
              <CardList sidebarExpanded={true}>
                {(internalCards||[]).map((card) => (
                  <Droppable droppableId={`card-${card._id}`} key={card._id}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        expanded={expandedCardId === card._id}
                      >
                        <CardHeader>
                          {card.author}
                          <EditButton onClick={() => toggleDropdown(card._id)}>
                            &#8942;
                          </EditButton>
                          {dropdownVisible === card._id && (
                            <Dropdown>
                              <DropdownItem
                                onClick={() => handleEditClick(card._id)}
                              >
                                Edit post
                              </DropdownItem>
                              <DropdownItem
                                onClick={() => handleDuplicate(card._id)}
                              >
                                Duplicate post
                              </DropdownItem>
                              <DropdownItem onClick={() => handleReportClick(card._id, card.author)}>
                                Report
                              </DropdownItem>
                              <DropdownItem
                                onClick={() => handleDelete(card._id)}
                              >
                                Delete post
                              </DropdownItem>
                            </Dropdown>
                          )}
                        </CardHeader>
                        <CardContent expanded={expandedCardId === card._id}>
                          <CardSubject>{card.subject}</CardSubject>
                          {card.imageUrl && (
                            <>
                              {card.imageUrl ? (
                                <a
                                  href={sanitizeUrl(card.imageUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <CardImage
                                    src={card.imageUrl}
                                    alt={card.subject}
                                    expanded={expandedCardId === card._id}
                                    onClick={() =>
                                      handleImageClick(card.imageUrl)
                                    }
                                  />
                                </a>
                              ) : (
                                <CardImage
                                  src={card.imageUrl}
                                  alt={card.subject}
                                  expanded={expandedCardId === card._id}
                                />
                              )}
                            </>
                          )}
                          {card.caption && (
                            <CardCaption>
                              {formatCaptionWithLinks(card.caption)}
                            </CardCaption>
                          )}
                          <CardText>{card.text}</CardText>
                          {card.tags && (
                            <TagsContainer>
                              {card.tags.map((tag, index) => (
                                <Tag key={index}>{tag}</Tag>
                              ))}
                            </TagsContainer>
                          )}
                        </CardContent>
                        <CollapseButton
                          onClick={() => handleExpandClick(card._id)}
                        >
                          {expandedCardId === card._id ? "Collapse" : "Expand"}
                        </CollapseButton>
                        {provided.placeholder}
                      </Card>
                    )}
                  </Droppable>
                ))}
              </CardList>
            </CardListContainer>
          </MainContent>
          <Sidebar expanded={isSidebarExpanded}>
            <SidebarHeader>
              <SidebarTitle>Tags Overview</SidebarTitle>
              <CountDisplay>
                <CountItem>
                  <CountLabel>Tags</CountLabel>
                  <CountValue>{tagCount}</CountValue>
                </CountItem>
                <CountItem>
                  <CountLabel>Cards</CountLabel>
                  <CountValue>{cardCount}</CountValue>
                </CountItem>
              </CountDisplay>
              <PopularTag>Popular:</PopularTag>
            </SidebarHeader>
            <Droppable droppableId="tagList">
              {(provided) => (
                <TagList {...provided.droppableProps} ref={provided.innerRef}>
                  {tag.map((tag, index) => (
                    <Draggable key={tag.id} draggableId={tag.id} index={index}>
                      {(provided) => (
                        <TagItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TagName>{tag.name}</TagName>
                        </TagItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TagList>
              )}
            </Droppable>
          </Sidebar>
        </DragDropContext>
        <ToggleSidebarButton
          expanded={isSidebarExpanded}
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        >
          {isSidebarExpanded ? ">" : "<"}
        </ToggleSidebarButton>
      </PageContainer>
    </>
  );
};

export default CList;

//https://docs.google.com/spreadsheets/d/1xMU7JICHB5EQ8W_yKXP-wq36BdCfd4Wx/edit?gid=627561471#gid=627561471
