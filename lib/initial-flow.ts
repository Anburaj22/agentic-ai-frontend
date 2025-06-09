import type { Node, Edge } from "reactflow"

export const initialNodes: Node[] = [
  // {
  //   id: "crew-1",
  //   type: "crew",
  //   position: { x: 400, y: 100 },
  //   data: {
  //     label: "App Security Analysis",
  //     process: "Process.sequential",
  //   },
  // },
  // {
  //   id: "agent-1",
  //   type: "agent",
  //   position: { x: 200, y: 250 },
  //   data: {
  //     label: "Security Researcher",
  //     role: "Senior IT Security researcher",
  //     goal: "Find security vulnerabilities in the application",
  //   },
  // },
  // {
  //   id: "agent-2",
  //   type: "agent",
  //   position: { x: 600, y: 250 },
  //   data: {
  //     label: "Security Analyst",
  //     role: "Senior security analyst",
  //     goal: "Analyze security findings and provide recommendations",
  //   },
  // },
  // {
  //   id: "task-1",
  //   type: "task",
  //   position: { x: 100, y: 400 },
  //   data: {
  //     label: "Collect Information",
  //     description: "Search and collect basic information about the application",
  //     output: "Basic information report",
  //   },
  // },
  // {
  //   id: "task-2",
  //   type: "task",
  //   position: { x: 300, y: 400 },
  //   data: {
  //     label: "Find Vulnerabilities",
  //     description: "Search for vulnerabilities in the application",
  //     output: "List of identified vulnerabilities",
  //   },
  // },
  // {
  //   id: "task-3",
  //   type: "task",
  //   position: { x: 500, y: 400 },
  //   data: {
  //     label: "Security Best Practices",
  //     description: "Find security best practices for using the app",
  //     output: "Security best practices report",
  //   },
  // },
  // {
  //   id: "task-4",
  //   type: "task",
  //   position: { x: 700, y: 400 },
  //   data: {
  //     label: "Common Mistakes",
  //     description: "Find common security mistakes when deploying or using app",
  //     output: "Common mistakes report",
  //   },
  // },
  // {
  //   id: "knowledge-1",
  //   type: "knowledge",
  //   position: { x: 400, y: 550 },
  //   data: {
  //     label: "Security Database",
  //     sourceType: "CSV File",
  //     path: "/data/security_vulnerabilities.csv",
  //   },
  // },
  // {
  //   id: "result-1",
  //   type: "result",
  //   position: { x: 400, y: 700 },
  //   data: {
  //     label: "Security Assessment",
  //     outputType: "Comprehensive Security Report",
  //     status: "Completed",
  //     created: "2023-03-13 14:35:45",
  //   },
  // },
]

export const initialEdges: Edge[] = [
  // {
  //   id: "e1-2",
  //   source: "crew-1",
  //   target: "agent-1",
  //   type: "custom",
  //   animated: true,
  // },
  // {
  //   id: "e1-3",
  //   source: "crew-1",
  //   target: "agent-2",
  //   type: "custom",
  //   animated: true,
  // },
  // {
  //   id: "e2-4",
  //   source: "agent-1",
  //   target: "task-1",
  //   type: "custom",
  // },
  // {
  //   id: "e2-5",
  //   source: "agent-1",
  //   target: "task-2",
  //   type: "custom",
  // },
  // {
  //   id: "e3-6",
  //   source: "agent-2",
  //   target: "task-3",
  //   type: "custom",
  // },
  // {
  //   id: "e3-7",
  //   source: "agent-2",
  //   target: "task-4",
  //   type: "custom",
  // },
  // {
  //   id: "e4-9",
  //   source: "task-1",
  //   target: "knowledge-1",
  //   type: "custom",
  // },
  // {
  //   id: "e5-9",
  //   source: "task-2",
  //   target: "knowledge-1",
  //   type: "custom",
  // },
  // {
  //   id: "e6-9",
  //   source: "task-3",
  //   target: "knowledge-1",
  //   type: "custom",
  // },
  // {
  //   id: "e7-9",
  //   source: "task-4",
  //   target: "knowledge-1",
  //   type: "custom",
  // },
  // {
  //   id: "e9-10",
  //   source: "knowledge-1",
  //   target: "result-1",
  //   type: "custom",
  //   animated: true,
  // },
]
