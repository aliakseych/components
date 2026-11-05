import { Cursor, CursorBody, CursorMessage, CursorName, CursorPointer } from "../index";

export default function Demo() {
  return (
    <Cursor>
      <CursorPointer className="text-chart-2" />
      <CursorBody className="border bg-card text-chart-2">
        <CursorName>Sam Lee</CursorName>
        <CursorMessage>Can we adjust the color?</CursorMessage>
      </CursorBody>
    </Cursor>
  );
}
