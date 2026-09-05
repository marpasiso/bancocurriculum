import LockResetIcon from "@mui/icons-material/LockReset";
import { Alert, Box, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { AppButton } from "@/components/app-actions";
import { resetPasswordAction } from "@/modules/password-reset-skill/actions";

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: { token?: string; error?: string };
}) {
  const token = searchParams.token ?? "";
  const hasToken = token.length > 0;

  return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 3, md: 6 } }}>
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", boxShadow: "0 16px 40px rgba(15,23,42,0.08)" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={2.25}>
            <Box>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                Redefinir senha
              </Typography>
              <Typography color="text.secondary">
                Crie uma nova senha para acessar sua conta.
              </Typography>
            </Box>

            {searchParams.error ? (
              <Alert severity="error" variant="outlined">
                {searchParams.error}
              </Alert>
            ) : null}

            {!hasToken ? (
              <Alert severity="warning" variant="outlined">
                Link inválido ou expirado. Solicite uma nova redefinição de senha.
              </Alert>
            ) : null}

            <Box action={resetPasswordAction} component="form">
              <Stack spacing={2}>
                <input name="token" type="hidden" value={token} />
                <TextField
                  autoComplete="new-password"
                  disabled={!hasToken}
                  fullWidth
                  label="Nova senha"
                  name="password"
                  required
                  size="small"
                  type="password"
                />
                <TextField
                  autoComplete="new-password"
                  disabled={!hasToken}
                  fullWidth
                  label="Confirmar nova senha"
                  name="confirmPassword"
                  required
                  size="small"
                  type="password"
                />
                <AppButton disabled={!hasToken} fullWidth minWidth="100%" startIcon={<LockResetIcon fontSize="small" />} type="submit" variant="contained">
                  Redefinir senha
                </AppButton>
              </Stack>
            </Box>

            <AppButton component={Link} href="/esqueci-minha-senha" fullWidth minWidth="100%" variant="outlined">
              Solicitar novo link
            </AppButton>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
