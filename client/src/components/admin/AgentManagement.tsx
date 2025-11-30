import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";

export function AgentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    areas: [] as string[]
  });
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/admin/agents"],
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["/api/areas"],
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      setIsDialogOpen(false);
      setFormData({ email: "", firstName: "", lastName: "", areas: [] });
    },
  });

  const handleAreaChange = (areaId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      areas: checked 
        ? [...prev.areas, areaId]
        : prev.areas.filter(id => id !== areaId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAgentMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Agent Management
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              <div>
                <Label>Assigned Areas</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                  {areas.map((area: any) => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={area.id}
                        checked={formData.areas.includes(area.id)}
                        onCheckedChange={(checked) => handleAreaChange(area.id, checked as boolean)}
                      />
                      <Label htmlFor={area.id} className="text-sm">
                        {area.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              {createAgentMutation.error && (
                <p className="text-red-500 text-sm">{createAgentMutation.error.message}</p>
              )}
              <Button type="submit" className="w-full" disabled={createAgentMutation.isPending}>
                {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No agents found</p>
          ) : (
            agents.map((agent: any) => (
              <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{agent.firstName} {agent.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                </div>
                <Badge variant="secondary">Agent</Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}