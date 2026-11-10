"use client"

import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core"
import { useTree } from "@headless-tree/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Tree, TreeItem, TreeItemLabel } from "./tree"

export interface OrgTreeNode {
  name: string
  role?: string
  /** Optional image URL; initials show when it is missing or fails to load. */
  avatar?: string
  /** Ids of the direct reports, keys of `nodes`. */
  children?: string[]
}

export interface OrgTreeProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Every node by id, including the root. */
  nodes: Record<string, OrgTreeNode>
  /** Id of the node that holds the top-level entries. It is not rendered. */
  rootId: string
  /** Ids expanded on first render. */
  defaultExpanded?: string[]
  /** Indentation per level in pixels. */
  indent?: number
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}

/** An organisation chart as an expandable tree with an avatar, name and role per person. */
export function OrgTree({
  nodes,
  rootId,
  defaultExpanded = [],
  indent = 24,
  className,
  ...props
}: OrgTreeProps) {
  const tree = useTree<OrgTreeNode>({
    initialState: { expandedItems: defaultExpanded },
    indent,
    rootItemId: rootId,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (id) => nodes[id],
      getChildren: (id) => nodes[id].children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  })

  return (
    <div className={cn("w-full max-w-xs", className)} {...props}>
      <Tree indent={indent} tree={tree}>
        {tree.getItems().map((item) => {
          const data = item.getItemData()
          return (
            <TreeItem key={item.getId()} item={item}>
              <TreeItemLabel className="gap-2 py-1">
                <Avatar className="size-6 shrink-0">
                  {data.avatar ? <AvatarImage src={data.avatar} alt={data.name} /> : null}
                  <AvatarFallback className="text-[9px]">{initialsOf(data.name)}</AvatarFallback>
                </Avatar>
                <span className="flex flex-col items-start">
                  <span className="text-sm leading-tight">{data.name}</span>
                  {data.role ? (
                    <span className="text-[10px] leading-tight text-muted-foreground">{data.role}</span>
                  ) : null}
                </span>
              </TreeItemLabel>
            </TreeItem>
          )
        })}
      </Tree>
    </div>
  )
}

export { Tree, TreeItem, TreeItemLabel } from "./tree"
