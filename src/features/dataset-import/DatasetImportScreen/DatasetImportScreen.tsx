import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { useFinancialInputSession } from '@/features/financial-input';
import { apiRequest, endpoints } from '@/shared/api';
import type {
  ClassificationConfirmationRequest,
  DatasetCreateResponse,
  DatasetIntelligenceResponse,
  TransactionCategory,
} from '@/shared/types';
import { AppIcon, Button, Card, ChoiceField, Page, useTheme } from '@/shared/ui';

import { TRANSACTION_CATEGORY_LABELS, TRANSACTION_CATEGORY_OPTIONS } from '../categories';
import { createStyles } from './DatasetImportScreen.styles';

function createUploadBody(asset: DocumentPicker.DocumentPickerAsset): FormData {
  const body = new FormData();
  if (asset.file) {
    body.append('file', asset.file);
  } else {
    body.append('file', {
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? 'text/csv',
    } as unknown as Blob);
  }
  return body;
}

function initialSelections(
  reviewItems: NonNullable<DatasetCreateResponse['intelligence']['review_items']>,
): Record<string, TransactionCategory> {
  return Object.fromEntries(
    reviewItems.map((item) => [item.transaction_id, item.predicted_category]),
  );
}

export default function DatasetImportScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const {
    datasetId,
    datasetStatus,
    datasetIntelligence,
    datasetNotice,
    setDatasetResponse,
    setDatasetNotice,
  } = useFinancialInputSession();
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, TransactionCategory>>(() =>
    initialSelections(datasetIntelligence?.review_items ?? []),
  );

  const reviewItems = useMemo(
    () => datasetIntelligence?.review_items ?? [],
    [datasetIntelligence?.review_items],
  );
  const recurringCount = datasetIntelligence?.recurring_patterns?.length ?? 0;

  const applyResponse = (response: DatasetCreateResponse | DatasetIntelligenceResponse) => {
    setSelections(initialSelections(response.intelligence.review_items ?? []));
    setDatasetResponse(response);
    setError(null);
  };

  const pickAndUpload = async () => {
    setError(null);
    setDatasetNotice(null);
    let result: DocumentPicker.DocumentPickerResult;
    try {
      result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
        multiple: false,
        base64: false,
      });
    } catch (pickerError) {
      setError(
        pickerError instanceof Error
          ? pickerError.message
          : '파일 선택기를 열지 못했어요. 다시 시도해 주세요.',
      );
      return;
    }

    if (result.canceled) return;

    const asset = result.assets[0];
    setFileName(asset.name);
    setUploading(true);
    try {
      const { data } = await apiRequest<DatasetCreateResponse>({
        method: 'POST',
        path: endpoints.datasets(),
        body: createUploadBody(asset),
      });
      applyResponse(data);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'CSV를 등록하지 못했어요. 파일을 확인하고 다시 시도해 주세요.',
      );
    } finally {
      setUploading(false);
    }
  };

  const refreshIntelligence = async () => {
    if (!datasetId) return;
    setRefreshing(true);
    setError(null);
    try {
      const { data } = await apiRequest<DatasetIntelligenceResponse>({
        method: 'GET',
        path: endpoints.datasetIntelligence(datasetId),
      });
      applyResponse(data);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : '분류 항목을 불러오지 못했어요. 다시 시도해 주세요.',
      );
    } finally {
      setRefreshing(false);
    }
  };

  const confirmClassifications = async () => {
    if (!datasetId || reviewItems.length === 0) return;

    const confirmations = reviewItems.flatMap((item) => {
      const category = selections[item.transaction_id];
      return category ? [{ transaction_id: item.transaction_id, category }] : [];
    });
    if (confirmations.length !== reviewItems.length) {
      setError('모든 거래의 카테고리를 선택해 주세요.');
      return;
    }

    const body: ClassificationConfirmationRequest = { confirmations };
    setConfirming(true);
    setError(null);
    try {
      const { data } = await apiRequest<DatasetCreateResponse>({
        method: 'POST',
        path: endpoints.confirmClassifications(datasetId),
        body,
      });
      // 확인 API가 새로 발급한 dataset_id까지 세션에 덮어쓴다. 이후 분석은
      // FinancialInputSessionContext의 이 최신 ID만 사용한다.
      applyResponse(data);
    } catch (confirmError) {
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : '분류 결과를 저장하지 못했어요. 다시 시도해 주세요.',
      );
    } finally {
      setConfirming(false);
    }
  };

  const ready = datasetStatus === 'ready' && datasetId !== null;
  const needsInput = datasetStatus === 'needs_input';

  return (
    <Page
      contentContainerStyle={styles.content}
      footer={
        ready ? (
          <Button label="정보 입력으로 계속" onPress={() => router.push('/household')} />
        ) : needsInput && reviewItems.length > 0 ? (
          <Button
            label={confirming ? '분류 저장 중...' : '분류 확인'}
            onPress={confirmClassifications}
            disabled={confirming}
          />
        ) : undefined
      }
    >
      <Text style={styles.title}>거래 내역 등록</Text>
      <Text style={styles.intro}>
        합성 거래 CSV를 올리면 AI가 카테고리를 확인한 뒤 분석에 연결해요.
      </Text>

      {datasetNotice ? (
        <Card style={styles.warningCard} accessibilityRole="alert">
          <Text style={styles.statusTitle}>{datasetNotice}</Text>
        </Card>
      ) : null}

      <Card style={styles.uploadCard}>
        <View style={styles.uploadHeader}>
          <View style={styles.uploadIcon}>
            <AppIcon
              name="database"
              size={theme.layout.sectionIconSize}
              color={theme.colors.brand}
              accentColor={theme.colors.mint}
            />
          </View>
          <View style={styles.uploadHeaderText}>
            <Text style={styles.cardTitle}>CSV 파일</Text>
            <Text style={styles.cardBody}>
              실제 개인정보가 없는 합성 거래 파일만 사용해 주세요.
            </Text>
          </View>
        </View>
        {fileName ? <Text style={styles.fileName}>선택한 파일: {fileName}</Text> : null}
        <Button
          label={uploading ? '업로드 중...' : datasetId ? '다른 CSV 선택' : 'CSV 선택'}
          variant="secondary"
          onPress={pickAndUpload}
          disabled={uploading || confirming}
        />
      </Card>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          오류: {error}
        </Text>
      ) : null}

      {datasetStatus ? (
        <Card style={ready ? styles.statusCard : styles.warningCard}>
          <Text style={styles.statusTitle}>
            {ready ? '거래 내역을 분석할 준비가 됐어요' : '확인이 필요한 거래가 있어요'}
          </Text>
          <Text style={styles.statusText}>
            {ready
              ? '이 데이터셋으로 기존 정보 입력과 현금흐름 분석을 이어갈게요.'
              : 'AI 예상값을 확인하고 각 거래의 카테고리를 선택해 주세요.'}
          </Text>
          {recurringCount > 0 ? (
            <Text style={styles.recurringText}>반복거래 {recurringCount}건 발견</Text>
          ) : null}
        </Card>
      ) : null}

      {needsInput ? (
        <View style={styles.reviewList}>
          <Text style={styles.sectionTitle}>거래 분류 확인</Text>
          {reviewItems.length === 0 ? (
            <Card>
              <Text style={styles.empty}>확인이 필요한 거래 목록이 비어 있어요.</Text>
              <Button
                label={refreshing ? '불러오는 중...' : '분류 항목 다시 불러오기'}
                variant="secondary"
                onPress={refreshIntelligence}
                disabled={refreshing}
              />
            </Card>
          ) : (
            reviewItems.map((item) => (
              <Card key={item.transaction_id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.merchant}>{item.merchant_label}</Text>
                  <Text style={styles.date}>{item.posted_at}</Text>
                </View>
                <View style={styles.predictionRow}>
                  <Text style={styles.prediction}>AI 예상</Text>
                  <Text style={styles.predictionStrong}>
                    {TRANSACTION_CATEGORY_LABELS[item.predicted_category]}
                  </Text>
                  <Text style={styles.prediction}>신뢰도 {Math.round(item.confidence * 100)}%</Text>
                </View>
                <ChoiceField
                  label="카테고리 선택"
                  options={TRANSACTION_CATEGORY_OPTIONS}
                  value={selections[item.transaction_id] ?? null}
                  onChange={(category) =>
                    setSelections((previous) => ({
                      ...previous,
                      [item.transaction_id]: category,
                    }))
                  }
                  testID={`classification-${item.transaction_id}`}
                />
              </Card>
            ))
          )}
        </View>
      ) : null}
    </Page>
  );
}
