import React from 'react';
import { View } from 'react-native';
import { Colors } from '../../theme';
import styles from '../../styles/home/MiniSparkBar.styles';

interface MiniSparkBarProps {
  heights: number[];
  activeIndex: number;
}

const MiniSparkBar: React.FC<MiniSparkBarProps> = ({ heights, activeIndex }) => (
  <View style={styles.sparkRow}>
    {heights.map((h, i) => (
      <View
        key={i}
        style={[
          styles.sparkBar,
          {
            height: h,
            backgroundColor:
              i === activeIndex
                ? Colors.gold
                : i > activeIndex - 2
                ? Colors.goldBorder
                : Colors.border,
          },
        ]}
      />
    ))}
  </View>
);

export default MiniSparkBar;