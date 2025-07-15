import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import React, { useRef, useEffect } from "react";

// Configure PDF.js worker with multiple fallback options
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PDFViewer({
  numPages,
  pageNumber,
  setPageNumber,
  setNumPages,
  responsePageNumbers = [],
}) {
  const containerRef = useRef(null);
  const pageRefs = useRef({});

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onDocumentLoadError(error) {
    console.error("PDF load error:", error);
  }

  // Navigate to the first relevant page when responsePageNumbers changes
  useEffect(() => {
    if (responsePageNumbers.length > 0) {
      setPageNumber(responsePageNumbers[0]);
    }
  }, [responsePageNumbers, setPageNumber]);

  // Function to scroll to a specific page
  const scrollToPage = (targetPageNumber) => {
    const pageElement = pageRefs.current[targetPageNumber];
    if (pageElement && containerRef.current) {
      pageElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setPageNumber(targetPageNumber);
    }
  };

  // Expose scrollToPage function to parent component
  useEffect(() => {
    if (window.scrollToPage) {
      window.scrollToPage = scrollToPage;
    } else {
      window.scrollToPage = scrollToPage;
    }
  }, []);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <Document
        file="/SIFAZ_manual.pdf"
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading="Loading PDF..."
        error="Failed to load PDF"
      >
        {Array.from({ length: numPages }, (_, index) => {
          const currentPageNumber = index + 1;
          return (
            <div
              key={`page_${currentPageNumber}`}
              ref={(el) => {
                if (el) {
                  pageRefs.current[currentPageNumber] = el;
                }
              }}
              className="mb-4"
            >
              <Page
                pageNumber={currentPageNumber}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="drop-shadow-lg"
                loading="Loading page..."
                error="Failed to load page"
              />
            </div>
          );
        })}
      </Document>
    </div>
  );
}

export default PDFViewer;
