import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";

interface Invite {
  id: string;
  invitee_email: string;
  created_at: string | null;
  accepted_at: string | null;
}

export function SentInvitesTable({ invites }: { invites: Invite[] }) {
  if (!invites.length) {
    return <p className="text-sm text-[#888888] py-6 text-center">No invites sent yet</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#2a2a2a] hover:bg-transparent">
          <TableHead className="text-[#888888] text-xs">Email</TableHead>
          <TableHead className="text-[#888888] text-xs">Sent</TableHead>
          <TableHead className="text-[#888888] text-xs">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites.map((invite) => (
          <TableRow key={invite.id} className="border-[#2a2a2a] hover:bg-[#1a1a1a]">
            <TableCell className="text-sm text-[#f0f0f0]">{invite.invitee_email}</TableCell>
            <TableCell className="text-sm text-[#888888]">
              {formatRelativeDate(invite.created_at)}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  invite.accepted_at
                    ? "text-xs border-[#22c55e]/20 text-[#22c55e] bg-[#22c55e]/10"
                    : "text-xs border-[#2a2a2a] text-[#888888]"
                }
              >
                {invite.accepted_at ? "Accepted" : "Pending"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
