"use client"

import { useParams } from "next/navigation";
import { CrewFlowEditor } from "@/components/crew-flow-editor"

export default function WorkflowPage() {
  const params = useParams();
  const id = params.id as string;
  return (
    <>
      <CrewFlowEditor workflowId={id} showHeader={true} />
    </>
  )
}
