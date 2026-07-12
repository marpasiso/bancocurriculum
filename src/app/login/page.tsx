import { loginAction } from "@/modules/employer-auth-skill/actions";
import { getSafeSessionUser } from "@/modules/security-skill/session";
import { UserRole } from "@prisma/client";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Link as MuiLink,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import Link from "next/link";
import { AppButton } from "@/components/app-actions";

export default async function LoginPage() {
  const user = await getSafeSessionUser();

  if (user?.role === UserRole.EMPLOYER) {
    redirect("/empregador/dashboard");
  }

  if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) {
    redirect("/admin/dashboard");
  }

  if (user) {
    redirect("/");
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 2, md: 5 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 440px" },
          gap: { xs: 2, md: 5 },
          alignItems: "center",
          minHeight: { md: "calc(100vh - 180px)" }
        }}
      >
        <Box>
          <Image
            alt="Janaina Pinheiro Treinamentos"
            className="login-brand-logo"
            height={312}
            priority
            src="/brand/logo-janaina-wide.jpeg"
            width={781}
          />
          <Chip label="Acesso seguro" color="secondary" variant="outlined" size="small" sx={{ mb: { xs: 1.25, md: 2 }, fontWeight: 800 }} />
          <Typography component="h1" variant="h2" sx={{ mb: { xs: 1.25, md: 2 }, maxWidth: 640, fontSize: { xs: "1.9rem", sm: "2.4rem", md: "3.25rem" }, lineHeight: 1.12 }}>
            Entre para consultar candidatos ou administrar a plataforma.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: { xs: 2, md: 3 }, maxWidth: 620, fontSize: { xs: "0.95rem", md: "1rem" } }}>
            Use sua conta de empregador para acessar a busca quando a assinatura estiver ativa, ou entre como
            administrador para registrar pagamentos, ativar assinaturas e acompanhar solicitações LGPD.
          </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Chip icon={<BusinessCenterOutlinedIcon />} label="Empregador com assinatura" size="small" variant="outlined" />
            <Chip icon={<AdminPanelSettingsOutlinedIcon />} label="Painel administrativo" size="small" variant="outlined" />
            </Stack>
        </Box>

        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", boxShadow: "0 16px 40px rgba(15,23,42,0.08)" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Stack spacing={1.25} sx={{ mb: { xs: 2, md: 3 }, alignItems: "center" }}>
              <Avatar sx={{ bgcolor: "primary.main", width: { xs: 40, md: 46 }, height: { xs: 40, md: 46 } }}>
                <LockOutlinedIcon />
              </Avatar>
              <Box sx={{ textAlign: "center" }}>
                <Typography component="h2" variant="h5" sx={{ fontWeight: 900 }}>
                  Login
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Acesso protegido por sessão segura
                </Typography>
              </Box>
            </Stack>

            <Box component="form" action={loginAction}>
              <Stack spacing={{ xs: 1.25, md: 2 }}>
                <TextField
                  name="email"
                  label="E-mail"
                  type="email"
                  autoComplete="email"
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  name="password"
                  label="Senha"
                  type="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  size="small"
                />
                <AppButton fullWidth minWidth="100%" type="submit" variant="contained" size="medium">
                  Entrar
                </AppButton>
              </Stack>
            </Box>

            <Divider sx={{ my: { xs: 2, md: 3 } }} />

            <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
              Use as credenciais fornecidas pelo administrador do sistema.
            </Alert>

            <Typography variant="body2" color="text.secondary" align="center">
              Ainda não tem conta de empregador?{" "}
              <MuiLink component={Link} href="/empregador/cadastro" sx={{ fontWeight: 800 }}>
                Criar conta
              </MuiLink>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
