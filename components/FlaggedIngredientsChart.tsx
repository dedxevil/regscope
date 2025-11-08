import React from 'react';
import type { Ingredient } from '../types';
import ChartLoader from './ChartLoader';

interface FlaggedIngredientsChartProps {
    ingredients: Ingredient[];
    isLoading: boolean;
}

const FlaggedIngredientsChart: React.FC<FlaggedIngredientsChartProps> = ({ ingredients, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col">
                 <h3 className="text-md font-bold mb-2 flex-shrink-0">Top 10 Flagged Ingredients</h3>
                 <ChartLoader />
            </div>
        )
    }

    const topIngredients = [...ingredients]
        .sort((a, b) => b.flaggedCount - a.flaggedCount)
        .slice(0, 10);

    const maxFlags = Math.max(...topIngredients.map(i => i.flaggedCount), 0);

    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="text-md font-bold mb-2 flex-shrink-0">Top 10 Flagged Ingredients</h3>
            <div className="flex-grow space-y-2 pr-2 overflow-y-auto">
                {topIngredients.map(ingredient => {
                    const barWidth = maxFlags > 0 ? (ingredient.flaggedCount / maxFlags) * 100 : 0;
                    return (
                        <div key={ingredient.id} className="flex items-center text-xs">
                            <div className="w-2/5 truncate pr-2 text-gray-600 dark:text-spotify-gray" title={ingredient.name}>
                                {ingredient.name}
                            </div>
                            <div className="w-3/5 flex items-center">
                                <div className="w-full bg-gray-200 dark:bg-spotify-light-dark rounded-full h-3.5">
                                    <div
                                        className="bg-amber-500 h-3.5 rounded-full"
                                        style={{ width: `${barWidth}%`, transition: 'width 0.5s ease-in-out' }}
                                    />
                                </div>
                                <span className="pl-2 font-semibold text-gray-700 dark:text-gray-200 w-8 text-right">{ingredient.flaggedCount}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FlaggedIngredientsChart;
