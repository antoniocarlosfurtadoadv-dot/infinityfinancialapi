export enum Permission {
  // 1. Dashboard
  DASHBOARD_VISUALIZAR_FINANCEIRO = "dashboard:visualizar_financeiro",

  // 2. Gestão do Sistema
  GESTAO_GERENCIAR_PERFIS = "gestao:gerenciar_perfis",
  GESTAO_GERENCIAR_USUARIOS = "gestao:gerenciar_usuarios",
  GESTAO_VISUALIZAR_LOGS = "gestao:visualizar_logs_usuarios",
  GESTAO_RECEBER_NOTIFICACOES = "gestao:receber_notificacoes",

  // 3. Admin (super-admin only)
  ADMIN_GERENCIAR_USUARIOS = "admin:gerenciar_usuarios",
  PLANOS_GERENCIAR = "admin:planos:gerenciar",
  ASSINATURAS_GERENCIAR = "admin:assinaturas:gerenciar",
  FATURAMENTO_VISUALIZAR = "admin:faturamento:visualizar",
}