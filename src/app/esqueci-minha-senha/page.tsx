import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Alert, Box, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { AppButton } from "@/components/app-actions";
import { requestPasswordResetAction } from "@/modules/password-reset-skill/actions";

export default function ForgotPasswordPage({
  searchParams
}: {
  searchParams: { error?: string; sent?: string };
}) {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 3, md: 6 } }}>
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", boxShadow: "0 16px 40px rgba(15,23,42,0.08)" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={2.25}>
            <Box>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                Esqueci minha senha
              </Typography>
              <Typography color="text.secondary">
                Informe o e-mail da sua conta para receber as instruções de redefinição de senha.
              </Typography>
            </Box>

            {searchParams.error ? (
              <Alert severity="error" variant="outlined">
                {searchParams.error}
              </Alert>
            ) : null}

            {searchParams.sent ? (
              <Alert severity="success" variant="outlined">
                {searchParams.sent}
              </Alert>
            ) : null}

            <Box action={requestPasswordResetAction} component="form">
              <Stack spacing={2}>
                <TextField
                  autoComplete="email"
                  fullWidth
                  inputProps={{ inputMode: "email", maxLength: 160 }}
                  label="E-mail"
                  name="email"
                  required
                  size="small"
                  type="email"
                />
                <AppButton fullWidth minWidth="100%" startIcon={<MailOutlineIcon fontSize="small" />} type="submit" variant="contained">
                  Enviar instruções
                </AppButton>
              </Stack>
            </Box>

            <AppButton component={Link} href="/login" fullWidth minWidth="100%" variant="outlined">
              Voltar para o login
            </AppButton>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
