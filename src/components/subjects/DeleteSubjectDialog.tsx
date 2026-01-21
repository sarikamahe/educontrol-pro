import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteSubject } from '@/hooks/useSubjects';
import { Loader2 } from 'lucide-react';

interface DeleteSubjectDialogProps {
  subject: {
    id: string;
    name: string;
    code: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSubjectDialog({ subject, open, onOpenChange }: DeleteSubjectDialogProps) {
  const deleteSubject = useDeleteSubject();

  const handleDelete = async () => {
    if (!subject) return;
    
    await deleteSubject.mutateAsync(subject.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Subject</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{subject?.name}</strong> ({subject?.code})?
            This will deactivate the subject and it will no longer appear in the system.
            This action can be undone by reactivating the subject.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteSubject.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteSubject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
