import React, { useEffect, useState, useRef } from 'react';
import type { RegulatoryDocument } from '../types';
import Spinner from './Spinner';

// Add pdfjsLib to the global scope to satisfy TypeScript
declare const pdfjsLib: any;

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);

interface DocumentViewerModalProps {
    document: RegulatoryDocument;
    onClose: () => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<string | null>(null);
    const [isLoadingPdf, setIsLoadingPdf] = useState(true);
    const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
    const [pdfText, setPdfText] = useState<string>('');
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isRendering, setIsRendering] = useState(false);

    const pdfDocRef = useRef<any>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const isPdf = document.name.toLowerCase().endsWith('.pdf');

    useEffect(() => {
        const loadPdfAndExtractText = async () => {
            setIsLoadingPdf(true);
            setPdfLoadError(null);
            setSearchResult(null);
            setSearchTerm('');
            setCurrentPage(1);
            setNumPages(0);
            setPdfText('');
            pdfDocRef.current = null;
            
            try {
                const loadingTask = pdfjsLib.getDocument(document.fileUrl);
                const pdf = await loadingTask.promise;
                pdfDocRef.current = pdf;
                setNumPages(pdf.numPages);

                // Extract text from all pages for searching
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
                }
                setPdfText(fullText.replace(/\s+/g, ' ').trim());
                setIsLoadingPdf(false);

            } catch (reason) {
                console.error(`Error loading PDF: ${reason}`);
                setPdfLoadError('Failed to load the PDF document. The file may be corrupted or the URL is invalid.');
                setIsLoadingPdf(false);
            }
        };
        
        if (isPdf && document.fileUrl) {
            loadPdfAndExtractText();
        } else {
            setIsLoadingPdf(false);
        }

    }, [document, isPdf]);
    
    useEffect(() => {
        if (isLoadingPdf || !pdfDocRef.current || !canvasRef.current || !canvasWrapperRef.current) return;

        const renderPage = async (pageNum: number) => {
            setIsRendering(true);
            try {
                const page = await pdfDocRef.current.getPage(pageNum);
                const canvas = canvasRef.current;
                const wrapper = canvasWrapperRef.current;
                if (!canvas || !wrapper) return;

                const containerWidth = wrapper.clientWidth;
                const viewport = page.getViewport({ scale: 1.0 });
                const scale = containerWidth / viewport.width;
                const scaledViewport = page.getViewport({ scale: scale });

                const context = canvas.getContext('2d');
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport
                };
                await page.render(renderContext).promise;
            } catch (error) {
                console.error("Error rendering page:", error);
                setPdfLoadError("Failed to render the PDF page.");
            } finally {
                setIsRendering(false);
            }
        };

        renderPage(currentPage);
    }, [currentPage, isLoadingPdf]);
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const term = searchTerm.trim();
        if (!term || !pdfText) return;

        setIsSearching(true);
        setSearchResult(null);
        
        // Use a short timeout to provide user feedback, as the search is now instant
        setTimeout(() => {
            try {
                // Escape special regex characters from user input for safe searching
                const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regex = new RegExp(escapedTerm, 'gi');
                const matches = pdfText.match(regex);
                const occurrences = matches ? matches.length : 0;
    
                if (occurrences > 0) {
                    setSearchResult(`Found '${term}' ${occurrences} time${occurrences > 1 ? 's' : ''}.`);
                } else {
                    setSearchResult(`'${term}' was not found.`);
                }
            } catch(error) {
                console.error("Search error:", error);
                setSearchResult("An error occurred during search.");
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };
    
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        if (currentPage < numPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-title"
        >
            <div 
                className="bg-white dark:bg-spotify-card rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 id="document-title" className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate pr-4">
                            {document.name}
                        </h2>
                        <button 
                            onClick={onClose} 
                            className="p-2 text-gray-500 hover:text-gray-800 dark:text-spotify-gray dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-spotify-light-dark"
                            aria-label="Close document viewer"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    {isPdf && (
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <div className="relative flex-grow">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Search for an ingredient in this PDF..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-md focus:ring-spotify-green focus:border-spotify-green"
                                        disabled={isLoadingPdf || !pdfDocRef.current}
                                    />
                                </div>
                                <button type="submit" disabled={isSearching || !searchTerm.trim() || !pdfDocRef.current} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-spotify-green hover:bg-blue-700 dark:hover:bg-green-500 disabled:opacity-50 flex items-center">
                                    {isSearching ? <Spinner className="w-5 h-5" /> : 'Search'}
                                </button>
                            </form>
                        </div>
                    )}
                </header>

                <main className="flex-grow p-4 overflow-y-auto bg-gray-200 dark:bg-spotify-dark">
                    {isPdf ? (
                        <div ref={canvasWrapperRef} className="w-full h-full flex justify-center">
                           {isLoadingPdf ? (
                               <div className="text-center text-gray-500 dark:text-spotify-gray p-10">
                                   <Spinner className="w-12 h-12 mx-auto mb-4 text-spotify-green" />
                                   <p className="font-semibold">Loading & Processing PDF...</p>
                               </div>
                           ) : pdfLoadError ? (
                                <div className="p-4 text-center text-red-600 dark:text-red-400">
                                    <h3 className="font-bold text-lg">Error</h3>
                                    <p>{pdfLoadError}</p>
                                </div>
                           ) : (
                               <div className="relative">
                                    {isRendering && (
                                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 rounded-md">
                                            <Spinner className="w-10 h-10 text-spotify-green" />
                                        </div>
                                    )}
                                   <canvas ref={canvasRef} className="rounded-md shadow-lg"></canvas>
                               </div>
                           )}
                        </div>
                    ) : (
                         <div className="p-6">
                            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                 <div>
                                    <h3 className="font-semibold text-gray-500 dark:text-spotify-gray">File Name</h3>
                                    <p>{document.name}</p>
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-gray-500 dark:text-spotify-gray">Associated Country</h3>
                                    <p className="flex items-center">
                                        <img src={`https://flagcdn.com/w20/${document.country.code.toLowerCase()}.png`} alt={`${document.country.name} flag`} className="w-5 h-auto mr-2 rounded" />
                                        {document.country.name}
                                    </p>
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-gray-500 dark:text-spotify-gray">Size</h3>
                                    <p>{document.size}</p>
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-gray-500 dark:text-spotify-gray">Uploaded On</h3>
                                    <p>{document.uploadedAt}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-500 dark:text-spotify-gray">Content Preview</h3>
                                    <div className="mt-2 p-4 bg-gray-100 dark:bg-spotify-light-dark rounded-md border border-gray-200 dark:border-gray-700">
                                        <p className="italic text-gray-500 dark:text-spotify-gray">
                                            Content preview for non-PDF files is not available.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                
                 {isPdf && !isLoadingPdf && !pdfLoadError && (
                    <footer className="flex-shrink-0 flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-700 dark:text-gray-300 min-h-[2rem] flex items-center w-1/3 font-medium">
                            {searchResult}
                        </div>
                        
                        {numPages > 0 && (
                            <div className="flex items-center justify-center gap-4 w-1/3">
                                <button onClick={handlePrevPage} disabled={currentPage <= 1 || isRendering} className="px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Page {currentPage} of {numPages}</span>
                                <button onClick={handleNextPage} disabled={currentPage >= numPages || isRendering} className="px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                            </div>
                        )}
                        <div className="w-1/3"></div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default DocumentViewerModal;