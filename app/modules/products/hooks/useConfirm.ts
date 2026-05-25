import { useState } from "react";

interface ConfirmOptions {
  title?: string;
  message: string;
  onConfirm: () => Promise<void> | void;
}

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const confirm = (newOptions: ConfirmOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await options.onConfirm();
      close();
    } catch (error) {
      console.error("Confirm action failed", error);
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    isLoading,
    options,
    confirm,
    close,
    handleConfirm,
  };
};
