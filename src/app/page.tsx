import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropdown } from "@/components/ui/dropdown";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">Showcase dos componentes</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aqui está uma visão geral de todos os componentes UI disponíveis.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Botões e inputs</CardTitle>
              <CardDescription>
                Exemplos básicos de ação e formulário.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button>Primário</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Digite seu nome" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost">Cancelar</Button>
            </CardFooter>
          </Card>

          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle>Seleção</CardTitle>
              <CardDescription>
                Checkbox, rádio e select nativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <label className="flex items-center gap-2">
                <Checkbox defaultChecked />
                <span className="text-sm">Aceito os termos</span>
              </label>

              <RadioGroup defaultValue="option-1" className="flex gap-4">
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="option-1" id="option-1" />
                  <Label htmlFor="option-1">Opção 1</Label>
                </label>
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="option-2" id="option-2" />
                  <Label htmlFor="option-2">Opção 2</Label>
                </label>
              </RadioGroup>

              <Dropdown
                options={[
                  { label: "Opção A", value: "a" },
                  { label: "Opção B", value: "b" },
                  { label: "Opção C", value: "c" },
                ]}
                placeholder="Selecione uma opção"
              />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardHeader>
              <CardTitle>Accordion</CardTitle>
              <CardDescription>Conteúdo em blocos expansíveis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Primeiro item</AccordionTrigger>
                  <AccordionContent>
                    Conteúdo do primeiro item com uma descrição simples.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Segundo item</AccordionTrigger>
                  <AccordionContent>
                    Conteúdo do segundo item com mais detalhes.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tooltip</CardTitle>
              <CardDescription>Informações contextuais.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Passe o mouse</Button>
                  </TooltipTrigger>
                  <TooltipContent>Texto de ajuda</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>Organização por abas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account" className="w-full">
                <TabsList>
                  <TabsTrigger value="account">Conta</TabsTrigger>
                  <TabsTrigger value="password">Senha</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="account"
                  className="mt-3 rounded-lg border border-border p-3"
                >
                  Configurações da conta.
                </TabsContent>
                <TabsContent
                  value="password"
                  className="mt-3 rounded-lg border border-border p-3"
                >
                  Configurações de senha.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diálogo</CardTitle>
              <CardDescription>Modal simples com ação.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Abrir diálogo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Olá!</DialogTitle>
                    <DialogDescription>
                      Este é um exemplo de modal usando os componentes do
                      projeto.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton>
                    <Button>Confirmar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Menu</CardTitle>
              <CardDescription>Menu de navegação simples.</CardDescription>
            </CardHeader>
            <CardContent>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex w-48 flex-col gap-2 p-3">
                        <NavigationMenuLink href="#">Início</NavigationMenuLink>
                        <NavigationMenuLink href="#">Sobre</NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tabela</CardTitle>
              <CardDescription>Estrutura básica de dados.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Ana</TableCell>
                    <TableCell>Ativo</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Bruno</TableCell>
                    <TableCell>Inativo</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
