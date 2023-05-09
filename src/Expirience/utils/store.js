import { create } from 'zustand';

import letterSources from '../sources/letters.js';
import collections from '../sources/collections.js';

const useStore = create(set => ({
  letterSources,

  elementIndex: -1,
  setElementIndex: index => set({ elementIndex: index }),
  
  collections: collections.map( collection => ({ isActive: false, ...collection }) ),

  activeCollection: null,
  setActiveCollection: collectionId => set({ activeCollection: collections.find(collection => collection.id = collectionId) })
  , resetActiveCollection: () => set({ activeCollection: null }),
}));

export default useStore;