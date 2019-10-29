// thingspin core libs
import { TreeNodeShape } from "app-thingspin-fms/react/components/react-checkbox-tree/models";

// cache
export let treeCache: {
    [name: string]: TreeNodeShape;
};

export function generateTree(facTrees: any[] = [], tags: any[] = [], facs: any[] = []): TreeNodeShape[] {
    treeCache = {}; // clean cache
    const tree: TreeNodeShape[] = [];

    // set list2map
    const tagsObj: any = {};
    const facsObj: any = {};
    for (const tag of tags) {
        tagsObj[tag.id] = tag;
    }
    for (const fac of facs) {
        facsObj[fac.id] = fac;
    }

    // internal method
    const findNode = (id: string): TreeNodeShape[] => {
        const ids: string[] = id.split('/');

        let node: TreeNodeShape;
        let children: TreeNodeShape[] = tree;
        for (const id of ids) {
            node = children.find((node: TreeNodeShape): boolean => node.id === id);
            if (!node) {
                break;
            }

            children = node.children;
        }

        return children;
    };

    // internal method
    const addChild = (node: TreeNodeShape) => {
        const children: TreeNodeShape[] = findNode(node.value);

        if (children) {
            const num: number = children.push({
                ...node,
                children: [],
            });

            // set map(Call by reference)
            treeCache[node.value] = children[num - 1];
        } else {
            console.error("parent children property not found", node);
        }
    };

    // internal method
    const getNodeInfo = (id: string, isFacility: boolean) => ({
        origin: isFacility ? facsObj[id] : tagsObj[id],
        type: isFacility ? 'facility' : 'tag',
    });

    for (const { treePath: value, facilityId, } of facTrees) {
        const paths: string[] = value.split('/');
        const id: string = paths[paths.length - 1];

        const { origin, type } = getNodeInfo(id, facilityId);

        addChild({
            id,
            type,
            paths,
            value,
            label: origin.name,
            origin,
        });
    }

    return tree;
}
