import { VikaLinkDelete } from "../src/VikaLinkDelete";
describe('VikaLinkDeleteTest', () => {
    test('getAllRecordss', async() => { 
        const records = await new VikaLinkDelete([]).getAllRecords();
        expect(records.length).toBeGreaterThan(0)
    });
})