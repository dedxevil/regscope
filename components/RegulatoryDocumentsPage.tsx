import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { MOCK_REGULATORY_DOCUMENTS, COUNTRIES } from '../constants';
import type { RegulatoryDocument, DocumentStatus, Country } from '../types';
import DocumentViewerModal from './DocumentViewerModal';

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);

const SortIcon: React.FC<{ direction: 'ascending' | 'descending' | null, className?: string }> = ({ direction, className }) => {
    if (!direction) return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
    if (direction === 'ascending') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
};

const statusStyles: Record<DocumentStatus, { bg: string, text: string }> = {
    'Uploaded': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-700 dark:text-blue-300' },
    'Training': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300' },
    'Ready': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-700 dark:text-green-300' },
    'Error': { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300' },
};

type SortKeys = 'name' | 'country' | 'status' | 'uploadedAt';

const RegulatoryDocumentsPage: React.FC = () => {
    const [documents, setDocuments] = useState<RegulatoryDocument[]>(MOCK_REGULATORY_DOCUMENTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [isTraining, setIsTraining] = useState(false);
    const [viewingDocument, setViewingDocument] = useState<RegulatoryDocument | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'ascending' | 'descending' } | null>({ key: 'uploadedAt', direction: 'descending' });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newDocs: RegulatoryDocument[] = acceptedFiles.map(file => {
            const now = new Date();
            now.setFullYear(2025); // Set the year to 2025
            return {
                id: `doc-${Date.now()}-${Math.random()}`,
                name: file.name,
                country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)], // Assign a random country for demo
                status: 'Uploaded' as const,
                uploadedAt: now.toISOString().split('T')[0],
                size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                fileUrl: URL.createObjectURL(file), // Create a temporary URL for the viewer
                file: file, // Keep the file object for processing
            };
        });
        setDocuments(prev => [...newDocs, ...prev]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'application/pdf': ['.pdf']} });

    const handleTrain = () => {
        setIsTraining(true);
        const docsToTrain = documents.filter(d => d.status === 'Uploaded');
        
        // 1. Set status to 'Training' immediately
        setDocuments(prev => prev.map(doc => docsToTrain.some(d => d.id === doc.id) ? { ...doc, status: 'Training' } : doc));
        
        // 2. Simulate training duration and set to 'Ready'
        setTimeout(() => {
            setDocuments(prev => prev.map(doc => docsToTrain.some(d => d.id === doc.id) ? { ...doc, status: 'Ready' } : doc));
            setIsTraining(false);
        }, 3000);
    };

    const handleDelete = (docId: string) => {
        setDocuments(prev => prev.filter(doc => {
            // Revoke object URL to prevent memory leaks for uploaded files
            if (doc.id === docId && doc.file) {
                URL.revokeObjectURL(doc.fileUrl);
            }
            return doc.id !== docId;
        }));
    }

    const requestSort = (key: SortKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirection = (key: SortKeys) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction;
    }

    const sortedDocuments = useMemo(() => {
        let filteredItems = [...documents];
        
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredItems = filteredItems.filter(doc =>
                doc.name.toLowerCase().includes(lowercasedFilter) ||
                doc.country.name.toLowerCase().includes(lowercasedFilter)
            );
        }

        if (sortConfig !== null) {
            filteredItems.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'country') {
                    aValue = a.country.name.toLowerCase();
                    bValue = b.country.name.toLowerCase();
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                    if (typeof aValue === 'string') {
                        aValue = aValue.toLowerCase();
                        bValue = (bValue as string).toLowerCase();
                    }
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredItems;
    }, [documents, sortConfig, searchTerm]);

    const newDocsCount = documents.filter(d => d.status === 'Uploaded').length;

    return (
        <>
            <div className="space-y-8">
                <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Upload Documents</h2>
                    <div 
                        {...getRootProps()} 
                        className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-spotify-green bg-green-50 dark:bg-green-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
                    >
                        <input {...getInputProps()} />
                        <UploadIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                        {isDragActive ? (
                            <p>Drop the PDF files here ...</p>
                        ) : (
                            <p>Drag 'n' drop PDF files here, or click to select files</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Only PDF files are accepted for now</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-spotify-card p-6 rounded-lg shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <h2 className="text-2xl font-bold">Regulatory Library</h2>
                        <button
                            onClick={handleTrain}
                            disabled={isTraining || newDocsCount === 0}
                            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-spotify-green dark:hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spotify-green disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isTraining ? 'Training in progress...' : `Train AI with ${newDocsCount} New Document${newDocsCount === 1 ? '' : 's'}`}
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-spotify-gray" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or country..."
                            className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-md focus:ring-spotify-green focus:border-spotify-green"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 dark:bg-spotify-light-dark dark:border-gray-700">
                                <tr>
                                    <th className="p-3">
                                        <button onClick={() => requestSort('name')} className="flex items-center font-semibold text-gray-600 dark:text-spotify-gray">
                                            Document Name
                                            <SortIcon direction={getSortDirection('name')} className="w-4 h-4 ml-2" />
                                        </button>
                                    </th>
                                    <th className="p-3 hidden md:table-cell">
                                        <button onClick={() => requestSort('country')} className="flex items-center font-semibold text-gray-600 dark:text-spotify-gray">
                                            Country
                                            <SortIcon direction={getSortDirection('country')} className="w-4 h-4 ml-2" />
                                        </button>
                                    </th>
                                    <th className="p-3">
                                        <button onClick={() => requestSort('status')} className="flex items-center font-semibold text-gray-600 dark:text-spotify-gray">
                                            Status
                                            <SortIcon direction={getSortDirection('status')} className="w-4 h-4 ml-2" />
                                        </button>
                                    </th>
                                    <th className="p-3 hidden sm:table-cell">
                                        <button onClick={() => requestSort('uploadedAt')} className="flex items-center font-semibold text-gray-600 dark:text-spotify-gray">
                                            Uploaded On
                                            <SortIcon direction={getSortDirection('uploadedAt')} className="w-4 h-4 ml-2" />
                                        </button>
                                    </th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedDocuments.map(doc => (
                                    <tr key={doc.id} className="border-b dark:border-gray-700">
                                        <td className="p-3 font-medium text-gray-800 dark:text-gray-100">
                                            <button 
                                                onClick={() => setViewingDocument(doc)} 
                                                className="text-left hover:underline focus:outline-none focus:ring-2 focus:ring-spotify-green rounded disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                                                disabled={!doc.fileUrl}
                                                title={!doc.fileUrl ? "Viewer only available for PDFs" : `View ${doc.name}`}
                                            >
                                                {doc.name}
                                            </button>
                                        </td>
                                        <td className="p-3 text-gray-600 dark:text-spotify-gray hidden md:table-cell">
                                            <img src={`https://flagcdn.com/w20/${doc.country.code.toLowerCase()}.png`} alt={`${doc.country.name} flag`} className="w-5 h-auto mr-2 inline-block rounded" />
                                            {doc.country.name}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[doc.status].bg} ${statusStyles[doc.status].text}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-600 dark:text-spotify-gray hidden sm:table-cell">{doc.uploadedAt}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleDelete(doc.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {sortedDocuments.length === 0 && (
                        <div className="text-center py-12 text-gray-500 dark:text-spotify-gray">
                             {documents.length > 0 ? (
                                <>
                                    <h3 className="text-lg font-semibold">No matching documents found.</h3>
                                    <p>Try adjusting your search terms.</p>
                                </>
                             ) : (
                                <>
                                    <h3 className="text-lg font-semibold">No documents found.</h3>
                                    <p>Upload documents to start training the AI.</p>
                                </>
                             )}
                        </div>
                    )}
                </div>
            </div>
            {viewingDocument && (
                <DocumentViewerModal 
                    document={viewingDocument} 
                    onClose={() => setViewingDocument(null)} 
                />
            )}
        </>
    );
};

export default RegulatoryDocumentsPage;