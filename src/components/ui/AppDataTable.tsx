import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";

export type AppDataTableColumn<Row> = {
  align?: "center" | "left" | "right";
  header: string;
  render: (row: Row) => ReactNode;
  span?: number;
  whiteSpace?: "normal" | "nowrap";
  width?: number | string;
};

export function AppDataTable<Row>({
  actionCount = 0,
  actions,
  columns,
  emptyMessage = "Nenhum registro encontrado.",
  getRowId,
  loading = false,
  pagination,
  rows
}: {
  actionCount?: number;
  actions?: (row: Row) => ReactNode;
  columns: AppDataTableColumn<Row>[];
  emptyMessage?: string;
  getRowId: (row: Row) => string;
  loading?: boolean;
  pagination?: ReactNode;
  rows: Row[];
}) {
  const bodyColSpan = columns.reduce((total, column) => total + (column.span ?? 1), 0) + (actions ? 1 : 0);
  const actionColumnWidth = actions ? Math.max(72, 16 + 36 * (actionCount || 1)) : undefined;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden"
      }}
    >
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 920, tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  align={column.align}
                  colSpan={column.span}
                  key={column.header}
                  sx={{
                    bgcolor: "background.default",
                    color: "text.secondary",
                    fontSize: "0.78rem",
                    fontWeight: 900,
                    py: 1,
                    whiteSpace: "nowrap",
                    width: column.width
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
              {actions ? (
                <TableCell
                  align="right"
                  sx={{
                    bgcolor: "background.default",
                    color: "text.secondary",
                    fontSize: "0.78rem",
                    fontWeight: 900,
                    px: 1,
                    py: 1,
                    whiteSpace: "nowrap",
                    width: actionColumnWidth
                  }}
                >
                  Ações
                </TableCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell colSpan={bodyColSpan}>
                    <Skeleton height={32} />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={bodyColSpan}>
                  <EmptyState description={emptyMessage} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow hover key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell
                      align={column.align}
                      colSpan={column.span}
                      key={column.header}
                      sx={{
                        overflow: "hidden",
                        maxWidth: column.width,
                        py: 1,
                        textOverflow: "ellipsis",
                        verticalAlign: "middle",
                        whiteSpace: column.whiteSpace
                      }}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                  {actions ? (
                    <TableCell align="right" sx={{ px: 1, py: 1, verticalAlign: "middle", whiteSpace: "nowrap", width: actionColumnWidth }}>
                      {actions(row)}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination}
    </Paper>
  );
}
