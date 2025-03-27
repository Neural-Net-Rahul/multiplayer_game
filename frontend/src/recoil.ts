import { atom, selector } from 'recoil'

const nameAtom = atom({
    key : "nameAtom",
    default : ''
})

const nameSelector = selector({
    key: "nameSelector",
    get: ({ get }) => {
        const nameValue = get(nameAtom);
        return nameValue;
    }
})

export {nameSelector, nameAtom}