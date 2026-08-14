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
      <TableContainer sx={{ overflowX: { xs: "visible", md: "auto" } }}>
        <Table
          size="small"
          sx={{
            minWidth: { xs: 0, md: 920 },
            tableLayout: { xs: "auto", md: "fixed" },
            width: "100%",
            "& thead": {
              display: { xs: "none", md: "table-header-group" }
            },
            "& tbody": {
              display: { xs: "block", md: "table-row-group" }
            },
            "& tbody tr": {
              border: { xs: 1, md: 0 },
              borderColor: { xs: "divider", md: "inherit" },
              borderRadius: { xs: 1, md: 0 },
              display: { xs: "block", md: "table-row" },
              mb: { xs: 1, md: 0 },
              overflow: { xs: "hidden", md: "visible" }
            },
            "& tbody td": {
              display: { xs: "block", md: "table-cell" },
              width: { xs: "100%", md: "auto" },
              "&::before": {
                color: "text.secondary",
                content: { xs: "attr(data-label)", md: "none" },
                display: { xs: "block", md: "none" },
                fontSize: "0.74rem",
                fontWeight: 900,
                mb: 0.25,
                textTransform: "uppercase"
              }
            }
          }}
        >
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
                      data-label={column.header}
                      key={column.header}
                      sx={{
                        maxWidth: column.width,
                        overflowWrap: "anywhere",
                        py: 1,
                        verticalAlign: "middle",
                        whiteSpace: column.whiteSpace ?? "normal",
                        wordBreak: "break-word"
                      }}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                  {actions ? (
                    <TableCell
                      align="right"
                      data-label="Ações"
                      sx={{
                        px: 1,
                        py: 1,
                        verticalAlign: "middle",
                        whiteSpace: { xs: "normal", md: "nowrap" },
                        width: { xs: "100%", md: actionColumnWidth }
                      }}
                    >
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
