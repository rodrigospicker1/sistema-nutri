export default defineNuxtPlugin(async () => {
  const { recarregar } = useNutricao()
  const erudio = useErudioMock()
  await Promise.all([recarregar(), erudio.recarregar()])
})
