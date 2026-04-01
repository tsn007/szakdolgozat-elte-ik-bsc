import { Box, Button, Modal, Rating, Textarea, Text } from "@mantine/core";
import { ModalText } from "./ModalText";
import { useRef, useState } from "react";
import { useCreateReviewMutation } from "../redux/reviewApi";

type ReviewModalProps = {
    opened: boolean;
    close: () => void;
    rentalId: string;
};

export function AddReviewModal({ opened, close, rentalId }: ReviewModalProps) {
    const [createReview, { isLoading }] = useCreateReviewMutation();
    const [ratingVal, setRatingVal] = useState(0);
    const [hoverVal, setHoverVal] = useState(0);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const displayValue = hoverVal > 0 ? hoverVal : ratingVal;

    const handleClose = () => {
        close();
        setRatingVal(0);
        setHoverVal(0);
        if (contentRef.current) {
            contentRef.current.value = "";
        }
    };

    const handlePost = async () => {
        const content = contentRef.current?.value || "";
        try {
            await createReview({ resId: rentalId, reviewData: { content: content, point: ratingVal } }).unwrap();
            handleClose();
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <Modal zIndex={1000} opened={opened} onClose={handleClose} title={<ModalText title="Leave a review" />}>
            <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Rating
                    fractions={2}
                    size="xl"
                    value={ratingVal}
                    onChange={setRatingVal}
                    onHover={setHoverVal}
                    onMouseLeave={() => setHoverVal(0)}
                />
                <Text c="dimmed" size="lg">
                    {`(${displayValue})`}
                </Text>
            </Box>
            <Textarea ref={contentRef} label="Your comment here"></Textarea>
            <Box style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <Button loading={isLoading} onClick={handlePost}>
                    Post
                </Button>
                <Button color="red" onClick={handleClose}>
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
}
