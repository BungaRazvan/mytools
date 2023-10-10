import cv2

import numpy as np

from PIL import ImageGrab

SCREEN_SIZE = ImageGrab.grab().size


class Image:
    def __init__(self, left_x: int, top_y: int, right_x: int, bottom_y: int) -> None:
        self.left_x = left_x
        self.top_y = top_y
        self.right_x = right_x
        self.bottom_y = bottom_y
        self.image = None

    def __call__(self):
        self.image = np.array(
            ImageGrab.grab(bbox=[self.left_x, self.top_y, self.right_x, self.bottom_y])
        )
        return self.image

    @staticmethod
    def thresholding(image, thresh, max_value=255):
        ret, thresh = cv2.threshold(
            Image.grayscale(image), thresh, max_value, cv2.THRESH_BINARY
        )

        return thresh

    @staticmethod
    def grayscale(image):
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    @staticmethod
    def normal(image):
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


class StarRailRewardsTextImage(Image):
    def __init__(self) -> None:
        super().__init__(
            100,
            int(SCREEN_SIZE[1] / 2) - 200,
            int(SCREEN_SIZE[1] / 4),
            int(SCREEN_SIZE[1] / 2) - 120,
        )

    def __call__(self):
        return self.normal(super().__call__())


class StarRailItemsImage(Image):
    def __init__(self) -> None:
        super().__init__(
            210,
            int(SCREEN_SIZE[1] / 2) - 200,
            int(SCREEN_SIZE[1] / 2),
            SCREEN_SIZE[1] - 300,
        )

    def __call__(self):
        return self.thresholding(super().__call__(), 150)
