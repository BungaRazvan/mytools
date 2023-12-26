from grt.image import SCREEN_SIZE, Image


class StarRailRelicImage(Image):
    def __init__(self) -> None:
        super().__init__(
            SCREEN_SIZE[1] - 400,
            SCREEN_SIZE[0] / 8,
            SCREEN_SIZE[0] / 2 + 650,
            SCREEN_SIZE[0] / 3 - 150,
        )

    def __call__(self):
        return self.normal(super().__call__())


class StarRailRelicStatsImage(Image):
    def __init__(self) -> None:
        super().__init__(
            SCREEN_SIZE[0] - 580, 200, SCREEN_SIZE[0] - 50, SCREEN_SIZE[1] / 2 + 20
        )

    def __call__(self):
        return self.grayscale(super().__call__())
