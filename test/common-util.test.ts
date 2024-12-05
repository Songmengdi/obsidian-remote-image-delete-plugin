import { chunk } from "../src/utils/common-util"

describe('common-util', () => {
    test('chunk', () => {
        const chunks = chunk([1,2,3,4,5],2)
        expect(chunks.length).toBe(3)
    })
})