import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { UserRole } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppButton } from "@/components/app-actions";
import { getSafeSessionUser } from "@/modules/security-skill/session";

const steps = [
  {
    icon: <PersonAddAltIcon color="primary" />,
    title: "Cadastre seu currículo",
    text: "Informe seus dados principais e autorize o uso para oportunidades de trabalho."
  },
  {
    icon: <BusinessCenterIcon color="primary" />,
    title: "Ative o acesso da empresa",
    text: "Empregadores autorizados ativam o acesso semanal para consultar profissionais."
  },
  {
    icon: <SearchIcon color="primary" />,
    title: "Consulte com segurança",
    text: "A busca acontece por filtros e somente dentro de um ambiente com acesso controlado."
  }
];

export default async function HomePage() {
  const user = await getSafeSessionUser();

  if (user?.role === UserRole.EMPLOYER) {
    redirect("/empregador/dashboard");
  }

  if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="public-home">
      <Container maxWidth="lg">
        <Box className="public-hero">
          <Stack spacing={1.5}>
            <Image
              alt="Janaina Pinheiro Treinamentos"
              className="public-hero-logo"
              height={312}
              priority
              src="/brand/logo-janaina-wide.jpeg"
              width={781}
            />
            <Stack spacing={1}>
              <Typography component="h1" variant="h2">
                Conecte sua empresa a profissionais disponíveis na sua região.
              </Typography>
              <Typography color="text.secondary" variant="h6">
                Cadastre currículos com consentimento LGPD e permita que empregadores autorizados encontrem candidatos por cidade e função.
              </Typography>
            </Stack>
            <Stack className="public-hero-actions" direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <AppButton component={Link} href="/candidato" minWidth={172} size="medium" variant="contained">
                Cadastrar currículo
              </AppButton>
              <AppButton component={Link} href="/empregador/cadastro" minWidth={144} size="medium" variant="outlined">
                Sou empregador
              </AppButton>
            </Stack>
          </Stack>
        </Box>

        <Box component="section" className="public-section">
          <Stack spacing={0.4} sx={{ mb: 1.25 }}>
            <Typography component="h2" variant="h5">Como funciona</Typography>
            <Typography color="text.secondary">
              Um fluxo direto para candidatos e empregadores, com regras claras de acesso.
            </Typography>
          </Stack>
          <Grid container spacing={1.25}>
            {steps.map((step) => (
              <Grid item key={step.title} md={4} xs={12}>
                <Card className="public-card" variant="outlined">
                  <CardContent>
                    <Stack className="public-card-content" spacing={0.85}>
                      <Box className="public-card-icon">{step.icon}</Box>
                      <Typography component="h3" variant="h6">{step.title}</Typography>
                      <Typography color="text.secondary" variant="body2">{step.text}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box component="section" className="trust-strip">
          Cadastro com consentimento LGPD · Sem envio de documentos · Acesso restrito a empregadores autorizados
        </Box>
      </Container>
    </main>
  );
}
