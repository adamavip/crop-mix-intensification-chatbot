import { useState } from "react";
import Sidebar from "./components/Sidebar";
import PDFViewer from "./components/PDFViewer";
import Chatbot from "./components/Chatbot";
import "./App.css";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function App() {
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [chatHistory, setChatHistory] = useState([]);
  const [userQueries, setUserQueries] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [responsePageNumbers, setResponsePageNumbers] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);

  const handleLoadConversation = (conversation) => {
    setCurrentConversation(conversation);
  };

  const handleDeleteConversation = (conversationId) => {
    setChatHistory((prev) => prev.filter((c) => c.id !== conversationId));
    // If the deleted conversation was the current one, clear it
    if (currentConversation && currentConversation.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  const handleDeleteQuery = (queryId) => {
    setUserQueries((prev) => prev.filter((q) => q.id !== queryId));
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    setUserQueries([]);
    setCurrentConversation(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleResponsePageNumbers = (pageNumbers) => {
    setResponsePageNumbers(pageNumbers);
  };

  return (
    <div className="flex h-screen w-screen">
      <aside
        className={`w-60 border-r ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-orange-50 border-orange-200"
        }`}
      >
        <Sidebar
          userQueries={userQueries}
          onDeleteQuery={handleDeleteQuery}
          onClearHistory={handleClearHistory}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      </aside>
      <main
        className={`flex-1 flex ${isDarkMode ? "bg-gray-800" : "bg-orange-50"}`}
      >
        <div
          className={`flex-6 overflow-y-auto overflow-x-hidden border-r p-6 ${
            isDarkMode ? "border-gray-700" : "border-orange-200"
          }`}
        >
          <PDFViewer
            numPages={numPages}
            pageNumber={pageNumber}
            setNumPages={setNumPages}
            setPageNumber={setPageNumber}
            responsePageNumbers={responsePageNumbers}
          />
        </div>

        <div
          className={`flex-8 overflow-auto h-full p-6 ${
            isDarkMode ? "bg-gray-900" : "bg-white"
          }`}
        >
          <Chatbot
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            userQueries={userQueries}
            setUserQueries={setUserQueries}
            onLoadConversation={handleLoadConversation}
            isDarkMode={isDarkMode}
            onResponsePageNumbers={handleResponsePageNumbers}
            currentConversation={currentConversation}
            setCurrentConversation={setCurrentConversation}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
