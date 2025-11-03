import React from 'react';

interface ProductListSkeletonProps {
    collapsed: boolean;
}

const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({ collapsed }) => {
    const items = Array.from({ length: 10 });

    if (collapsed) {
        return (
            <div className="animate-pulse flex-grow overflow-y-auto">
                <ul>
                    {items.map((_, index) => (
                        <li key={index} className="h-12 flex items-center justify-center">
                            <div className="h-4 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className="animate-pulse p-4 flex-grow overflow-y-auto">
            <div className="space-y-4">
                {items.map((_, index) => (
                    <div key={index}>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductListSkeleton;
